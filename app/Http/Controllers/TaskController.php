<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReorderTasksRequest;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Services\TaskOrderingService;

class TaskController extends Controller
{   
    public function __construct(
        private readonly TaskOrderingService $taskOrdering
    ) {
    }

    private function getGuestId(): int
    {
        // Возвращаем ID первого пользователя как общего владельца данных
        return (int) User::first()?->id ?? 1;
    }

    public function list(): JsonResponse
    {
        $tasks = Task::query()
            ->where('user_id', $this->getGuestId())
            ->orderBy('scheduled_for')
            ->orderBy('position')
            ->orderBy('id')
            ->get()
            ->map(fn (Task $task) => $this->serializeTask($task));

        return response()->json($tasks);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $userId = $this->getGuestId();
        $validated = $request->validated();
        $validated['status'] ??= 'todo';

        $task = DB::transaction(function () use ($userId, $validated) {
            $validated['position'] = $this->taskOrdering->nextPositionForDate(
                $userId,
                $validated['scheduled_for']
            );

            return Task::query()->create([
                ...$validated,
                'user_id' => $userId,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Задача создана!',
            'task' => $this->serializeTask($task),
        ], 201);
    }

    public function update(UpdateTaskRequest $request, int $id): JsonResponse
    {    
        $userId = $this->getGuestId();
        
        try {
            $task = $this->taskOrdering->findUserTask($userId, $id);
        } catch (ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Задача не найдена',
            ], 404);
        }

        $validated = $request->validated();
        $validated['status'] ??= $task->status ?? 'todo';

        $oldDate = $task->scheduled_for?->toDateString();
        $newDate = $validated['scheduled_for'];

        DB::transaction(function () use ($task, $validated, $oldDate, $newDate, $userId) {
            if ($oldDate !== $newDate) {
                $validated['position'] = $this->taskOrdering->nextPositionForDate($userId, $newDate);
            }

            $task->update($validated);

            if ($oldDate && $oldDate !== $newDate) {
                $this->taskOrdering->normalizePositionsForDate($userId, $oldDate);
            }
        });

        $task->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Задача обновлена!',
            'task' => $this->serializeTask($task),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {   
        $userId = $this->getGuestId();

        try {
            $task = $this->taskOrdering->findUserTask($userId, $id);
        } catch (ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Задача не найдена',
            ], 404);
        }

        $scheduledFor = $task->scheduled_for?->toDateString();

        DB::transaction(function () use ($task, $userId, $scheduledFor) {
            $task->delete();

            if ($scheduledFor) {
                $this->taskOrdering->normalizePositionsForDate($userId, $scheduledFor);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Задача удалена!',
        ]);
    }

    public function reorder(ReorderTasksRequest $request): JsonResponse
    {
        $data = $request->validated();
        $userId = $this->getGuestId();

        $this->taskOrdering->reorderColumns($userId, $data['columns']);

        return response()->json([
            'success' => true,
            'message' => 'Порядок карточек обновлен',
        ]);
    }

    private function serializeTask(Task $task): array
    {
        return [
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'scheduled_for' => $task->scheduled_for?->toDateString(),
            'position' => $task->position,
            'status' => $task->status,
        ];
    }
}
