<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\User;

class WorkspaceController extends Controller
{
    private function getGuestUser(): User
    {
        return User::first() ?? User::factory()->create();
    }

    public function weekBoard(Request $request, ?string $date = null)
    {
        $currentDate = $this->resolveWeekDate($date);

        $startOfWeek = $currentDate->copy()->startOfWeek(Carbon::MONDAY);
        $endOfWeek = $currentDate->copy()->endOfWeek(Carbon::SUNDAY);

        $tasks = $this->getGuestUser()->tasks()
            ->whereNotNull('scheduled_for')
            ->whereBetween('scheduled_for', [
                $startOfWeek->toDateString(),
                $endOfWeek->toDateString(),
            ])
            ->orderBy('scheduled_for')
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        $days = [];

        for ($i = 0; $i < 7; $i++) {
            $day = $startOfWeek->copy()->addDays($i);

            $dayTasks = $tasks->filter(function ($task) use ($day) {
                return optional($task->scheduled_for)->toDateString() === $day->toDateString();
            })->values();

            $days[] = [
                'date' => $day->toDateString(),
                'day_name' => $day->translatedFormat('l'),
                'day_number' => $day->format('d'),
                'tasks' => $dayTasks,
            ];
        }

        return response()->json([
            'days' => $days,
            'startOfWeek' => $startOfWeek->toDateString(),
            'endOfWeek' => $endOfWeek->toDateString(),
        ]);
    }

    public function notebook(Request $request)
    {
        $user = $this->getGuestUser();

        if (!$user->notebookSheets()->exists()) {
            $user->notebookSheets()->create([
                'display_order' => 1,
            ]);
        }

        $sheets = $user->notebookSheets()
            ->orderBy('display_order')
            ->get();

        $requestedSheetId = $request->integer('sheet');

        $activeSheet = $sheets->firstWhere('id', $requestedSheetId) ?? $sheets->first();

        $blocks = $activeSheet->noteBlocks()
            ->orderBy('id')
            ->get();

        return response()->json([
            'sheets' => $sheets,
            'activeSheet' => $activeSheet,
            'blocks' => $blocks,
        ]);
    }

    private function resolveWeekDate(?string $date): Carbon
    {
        if ($date === null) {
            return now()->startOfDay();
        }

        try {
            $parsed = Carbon::createFromFormat('!Y-m-d', $date);

            if ($parsed->format('Y-m-d') !== $date) {
                abort(404);
            }

            return $parsed->startOfDay();
        } catch (\Throwable $e) {
            abort(404);
        }
    }

    private function resolveMonth(?string $month): Carbon
    {
        if ($month === null) {
            return now()->startOfMonth();
        }

        try {
            $parsed = Carbon::createFromFormat('!Y-m', $month);

            if ($parsed->format('Y-m') !== $month) {
                abort(404);
            }

            return $parsed->startOfMonth();
        } catch (\Throwable $e) {
            abort(404);
        }
    }

    public function month(Request $request, ?string $month = null)
    {
        $currentMonth = $this->resolveMonth($month);


        $gridStart = $currentMonth->copy()
        ->startOfMonth()
        ->startOfWeek(Carbon::MONDAY);

        $lastDayOfMonth = $currentMonth->copy()
        ->endOfMonth()
        ->startOfDay();

        $daysNeeded = $gridStart->diffInDays($lastDayOfMonth) + 1;

        $weeksCount = max(5, (int) ceil($daysNeeded / 7));

        $gridEnd = $gridStart->copy()->addDays(($weeksCount * 7) - 1);

        $tasks = $this->getGuestUser()->tasks()
            ->whereNotNull('scheduled_for')
            ->whereBetween('scheduled_for', [
                $gridStart->toDateString(),
                $gridEnd->toDateString(),
            ])
            ->orderBy('scheduled_for')
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        $tasksByDate = $tasks->groupBy(
            fn ($task) => optional($task->scheduled_for)->format('Y-m-d')
        );

        $days = [];
        $cursor = $gridStart->copy();

        for ($week = 0; $week < $weeksCount; $week++) {
            $row = [];

            for ($day = 0; $day < 7; $day++) {
                $dateKey = $cursor->format('Y-m-d');

                $row[] = [
                    'date' => $cursor->copy(),
                    'date_key' => $dateKey,
                    'isCurrentMonth' => $cursor->format('Y-m') === $currentMonth->format('Y-m'),
                    'isToday' => $cursor->isToday(),
                    'tasks' => $tasksByDate->get($dateKey, collect()),
                ];

                $cursor->addDay();
            }

            $days[] = $row;
        }

        return response()->json([
            'currentMonth' => $currentMonth->format('Y-m'),
            'days' => $days,
            'weeksCount' => $weeksCount,
            'prevMonth' => $currentMonth->copy()->subMonth()->format('Y-m'),
            'nextMonth' => $currentMonth->copy()->addMonth()->format('Y-m'),
        ]);
    }
}
