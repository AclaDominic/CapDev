<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\PatientVisit;
use App\Models\Payment;
use App\Models\PerformanceGoal;
use App\Models\GoalProgressSnapshot;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsSeeder extends Seeder
{
    /**
     * Seed comprehensive analytics data for 1 year to test admin analytics and monthly reports.
     */
    public function run(): void
    {
        $this->command->info('Starting AnalyticsSeeder - generating 1 year of comprehensive data...');

        // Clear existing analytics data
        $this->clearExistingData();

        // Get required data
        $patients = $this->ensurePatients();
        $services = $this->ensureServices();
        $adminUser = User::where('role', 'admin')->first();

        if (!$adminUser) {
            $this->command->error('No admin user found. Please run UserSeeder first.');
            return;
        }

        // Generate 1 year of data
        $startDate = Carbon::now()->subYear()->startOfMonth();
        $endDate = Carbon::now()->endOfMonth();

        $this->command->info("Generating data from {$startDate->format('Y-m-d')} to {$endDate->format('Y-m-d')}");

        // Generate performance goals
        $this->generatePerformanceGoals($adminUser, $startDate);

        // Generate monthly data
        $current = $startDate->copy();
        while ($current->lte($endDate)) {
            $this->generateMonthData($current, $patients, $services, $adminUser);
            $current->addMonth();
        }

        // Generate goal progress snapshots
        $this->generateGoalProgressSnapshots($startDate, $endDate);

        $this->command->info('AnalyticsSeeder completed successfully!');
        $this->displaySummary();
    }

    private function clearExistingData(): void
    {
        $this->command->info('Clearing existing analytics data...');
        
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        PatientVisit::truncate();
        Appointment::truncate();
        Payment::truncate();
        GoalProgressSnapshot::truncate();
        PerformanceGoal::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    private function ensurePatients(): array
    {
        $patients = Patient::all();
        
        if ($patients->count() < 50) {
            $this->command->info('Generating additional patients for analytics...');
            
            $faker = \Faker\Factory::create();
            $newPatients = [];
            
            for ($i = 0; $i < 50; $i++) {
                $newPatients[] = [
                    'first_name' => $faker->firstName(),
                    'last_name' => $faker->lastName(),
                    'middle_name' => $faker->optional(0.7)->firstName(),
                    'birthdate' => $faker->dateTimeBetween('-80 years', '-18 years')->format('Y-m-d'),
                    'sex' => $faker->randomElement(['male', 'female']),
                    'contact_number' => '09' . $faker->numerify('########'),
                    'address' => $faker->city() . ', ' . $faker->state(),
                    'is_linked' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            Patient::insert($newPatients);
            $patients = Patient::all();
        }
        
        return $patients->pluck('id')->toArray();
    }

    private function ensureServices(): array
    {
        $services = Service::all();
        
        if ($services->count() < 10) {
            $this->command->info('Generating additional services for analytics...');
            
            $additionalServices = [
                ['name' => 'Root Canal Treatment', 'price' => 8000, 'category' => 'Endodontic', 'estimated_minutes' => 120],
                ['name' => 'Crown Placement', 'price' => 12000, 'category' => 'Prosthodontic', 'estimated_minutes' => 90],
                ['name' => 'Orthodontic Consultation', 'price' => 1500, 'category' => 'Orthodontic', 'estimated_minutes' => 30],
                ['name' => 'Dental Implant', 'price' => 25000, 'category' => 'Surgical', 'estimated_minutes' => 180],
                ['name' => 'Gum Treatment', 'price' => 4000, 'category' => 'Periodontic', 'estimated_minutes' => 60],
                ['name' => 'Oral Surgery', 'price' => 15000, 'category' => 'Surgical', 'estimated_minutes' => 120],
                ['name' => 'Dental Checkup', 'price' => 1000, 'category' => 'Preventive', 'estimated_minutes' => 20],
                ['name' => 'X-Ray', 'price' => 500, 'category' => 'Diagnostic', 'estimated_minutes' => 10],
            ];
            
            foreach ($additionalServices as $service) {
                Service::create(array_merge($service, [
                    'description' => 'Professional ' . strtolower($service['name']),
                    'is_excluded_from_analytics' => false,
                    'is_special' => false,
                    'special_start_date' => null,
                    'special_end_date' => null,
                ]));
            }
            
            $services = Service::all();
        }
        
        return $services->pluck('id')->toArray();
    }

    private function generatePerformanceGoals(User $adminUser, Carbon $startDate): void
    {
        $this->command->info('Generating performance goals...');
        
        $goals = [
            [
                'period_type' => 'monthly',
                'period_start' => $startDate->copy()->startOfMonth(),
                'metric' => 'total_visits',
                'target_value' => 200,
                'status' => 'active',
            ],
            [
                'period_type' => 'monthly',
                'period_start' => $startDate->copy()->startOfMonth(),
                'metric' => 'revenue',
                'target_value' => 500000,
                'status' => 'active',
            ],
            [
                'period_type' => 'monthly',
                'period_start' => $startDate->copy()->startOfMonth(),
                'metric' => 'appointment_completion_rate',
                'target_value' => 85,
                'status' => 'active',
            ],
        ];
        
        foreach ($goals as $goal) {
            PerformanceGoal::create(array_merge($goal, [
                'created_by' => $adminUser->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    private function generateMonthData(Carbon $month, array $patients, array $services, User $adminUser): void
    {
        $this->command->info("Generating data for {$month->format('Y-m')}...");
        
        $startOfMonth = $month->copy()->startOfMonth();
        $endOfMonth = $month->copy()->endOfMonth();
        $daysInMonth = $startOfMonth->daysInMonth;
        
        $visitRows = [];
        $appointmentRows = [];
        $paymentRows = [];
        
        // Generate data for each day
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $currentDay = $startOfMonth->copy()->addDays($day - 1);
            
            // Skip Sundays (clinic closed)
            if ($currentDay->isSunday()) {
                continue;
            }
            
            // Generate visits for the day (6-25 visits per day)
            $visitsToday = $this->getDailyVisitCount($currentDay);
            
            for ($i = 0; $i < $visitsToday; $i++) {
                $patientId = $patients[array_rand($patients)];
                $serviceId = $services[array_rand($services)];
                
                // Generate realistic time slots
                $timeSlot = $this->generateTimeSlot($currentDay);
                $startTime = $timeSlot['start'];
                $endTime = $timeSlot['end'];
                
                // Determine visit status
                $status = $this->getVisitStatus($currentDay);
                
                // Create visit
                $visitData = [
                    'patient_id' => $patientId,
                    'service_id' => $serviceId,
                    'visit_date' => $currentDay->toDateString(),
                    'start_time' => $startTime->toDateTimeString(),
                    'end_time' => $endTime->toDateTimeString(),
                    'status' => $status,
                    'note' => $this->generateVisitNote(),
                    'created_at' => $startTime->toDateTimeString(),
                    'updated_at' => $endTime->toDateTimeString(),
                ];
                
                $visitRows[] = $visitData;
                
                // Create appointment for 60% of visits
                if (rand(1, 100) <= 60) {
                    $appointmentStatus = $this->getAppointmentStatus($status);
                    $appointmentData = [
                        'patient_id' => $patientId,
                        'service_id' => $serviceId,
                        'patient_hmo_id' => null,
                        'date' => $currentDay->toDateString(),
                        'time_slot' => $timeSlot['slot'],
                        'reference_code' => 'APT' . strtoupper(uniqid()),
                        'status' => $appointmentStatus,
                        'payment_method' => $this->getPaymentMethod(),
                        'payment_status' => $this->getPaymentStatus($appointmentStatus),
                        'notes' => $this->generateAppointmentNote(),
                        'created_at' => $startTime->toDateTimeString(),
                        'updated_at' => $startTime->toDateTimeString(),
                    ];
                    
                    $appointmentRows[] = $appointmentData;
                }
                
                // Create payment for completed visits
                if ($status === 'completed') {
                    $service = Service::find($serviceId);
                    $amount = $service ? $service->price : 2000;
                    
                    $paymentData = [
                        'appointment_id' => null,
                        'patient_visit_id' => null, // Will be updated after visit creation
                        'currency' => 'PHP',
                        'amount_due' => $amount,
                        'amount_paid' => $amount,
                        'method' => $this->getPaymentMethod(),
                        'status' => 'paid',
                        'reference_no' => 'PAY' . strtoupper(uniqid()),
                        'paid_at' => $endTime->toDateTimeString(),
                        'created_by' => $adminUser->id,
                        'created_at' => $endTime->toDateTimeString(),
                        'updated_at' => $endTime->toDateTimeString(),
                    ];
                    
                    $paymentRows[] = $paymentData;
                }
            }
        }
        
        // Bulk insert visits
        foreach (array_chunk($visitRows, 1000) as $chunk) {
            PatientVisit::insert($chunk);
        }
        
        // Bulk insert appointments
        foreach (array_chunk($appointmentRows, 1000) as $chunk) {
            Appointment::insert($chunk);
        }
        
        // Create payments and link them to visits
        $this->createPaymentsForVisits($paymentRows, $startOfMonth, $endOfMonth);
        
        $this->command->info("Generated {$month->format('Y-m')}: " . count($visitRows) . " visits, " . count($appointmentRows) . " appointments");
    }

    private function getDailyVisitCount(Carbon $day): int
    {
        // More visits on weekdays, fewer on weekends
        if ($day->isWeekend()) {
            return rand(3, 8);
        }
        
        // Seasonal variation
        $month = $day->month;
        $baseCount = 15;
        
        // Higher in summer months (March-May) and December
        if (in_array($month, [3, 4, 5, 12])) {
            $baseCount += 5;
        }
        
        // Lower in January and February
        if (in_array($month, [1, 2])) {
            $baseCount -= 3;
        }
        
        return rand($baseCount - 5, $baseCount + 10);
    }

    private function generateTimeSlot(Carbon $day): array
    {
        // Clinic hours: 8 AM to 6 PM
        $hour = rand(8, 17);
        $minute = [0, 15, 30, 45][array_rand([0, 1, 2, 3])];
        
        $start = $day->copy()->setTime($hour, $minute, 0);
        $duration = rand(20, 120); // 20 minutes to 2 hours
        $end = $start->copy()->addMinutes($duration);
        
        return [
            'start' => $start,
            'end' => $end,
            'slot' => sprintf('%02d:%02d-%02d:%02d', $hour, $minute, $end->hour, $end->minute),
        ];
    }

    private function getVisitStatus(Carbon $day): string
    {
        // 85% completed, 10% pending, 5% rejected
        $rand = rand(1, 100);
        if ($rand <= 85) return 'completed';
        if ($rand <= 95) return 'pending';
        return 'rejected';
    }

    private function getAppointmentStatus(string $visitStatus): string
    {
        switch ($visitStatus) {
            case 'completed':
                return 'completed';
            case 'pending':
                return 'approved';
            case 'rejected':
                return 'cancelled';
            default:
                return 'approved';
        }
    }

    private function getPaymentMethod(): string
    {
        $methods = ['cash', 'maya', 'hmo'];
        return $methods[array_rand($methods)];
    }

    private function getPaymentStatus(string $appointmentStatus): string
    {
        if ($appointmentStatus === 'completed') {
            return rand(1, 100) <= 90 ? 'paid' : 'unpaid';
        }
        return 'unpaid';
    }

    private function generateVisitNote(): ?string
    {
        $notes = [
            'Regular checkup completed',
            'Treatment successful',
            'Patient satisfied with service',
            'Follow-up scheduled',
            'Additional treatment recommended',
            null,
            null,
            null,
        ];
        
        return $notes[array_rand($notes)];
    }

    private function generateAppointmentNote(): ?string
    {
        $notes = [
            'Patient confirmed appointment',
            'Reminder sent',
            'Walk-in patient',
            'Emergency appointment',
            null,
            null,
            null,
        ];
        
        return $notes[array_rand($notes)];
    }

    private function createPaymentsForVisits(array $paymentRows, Carbon $startOfMonth, Carbon $endOfMonth): void
    {
        // Get completed visits for the month
        $visits = PatientVisit::whereBetween('start_time', [$startOfMonth, $endOfMonth])
            ->where('status', 'completed')
            ->get();
        
        foreach ($visits as $index => $visit) {
            if ($index < count($paymentRows)) {
                $paymentData = $paymentRows[$index];
                $paymentData['patient_visit_id'] = $visit->id;
                
                Payment::create($paymentData);
            }
        }
    }

    private function generateGoalProgressSnapshots(Carbon $startDate, Carbon $endDate): void
    {
        $this->command->info('Generating goal progress snapshots...');
        
        $goals = PerformanceGoal::all();
        $current = $startDate->copy()->startOfMonth();
        
        while ($current->lte($endDate)) {
            foreach ($goals as $goal) {
                $actualValue = $this->calculateGoalProgress($goal, $current);
                
                GoalProgressSnapshot::create([
                    'goal_id' => $goal->id,
                    'as_of_date' => $current->copy()->endOfMonth(),
                    'actual_value' => $actualValue,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            
            $current->addMonth();
        }
    }

    private function calculateGoalProgress(PerformanceGoal $goal, Carbon $month): int
    {
        $startOfMonth = $month->copy()->startOfMonth();
        $endOfMonth = $month->copy()->endOfMonth();
        
        switch ($goal->metric) {
            case 'total_visits':
                return PatientVisit::whereBetween('start_time', [$startOfMonth, $endOfMonth])
                    ->where('status', 'completed')
                    ->count();
                    
            case 'revenue':
                return Payment::whereHas('patientVisit', function ($query) use ($startOfMonth, $endOfMonth) {
                    $query->whereBetween('start_time', [$startOfMonth, $endOfMonth])
                        ->where('status', 'completed');
                })
                ->where('status', 'paid')
                ->sum('amount_paid');
                
            case 'appointment_completion_rate':
                $totalAppointments = Appointment::whereBetween('date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
                    ->where('status', '!=', 'cancelled')
                    ->count();
                    
                $completedAppointments = Appointment::whereBetween('date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
                    ->where('status', 'completed')
                    ->count();
                    
                return $totalAppointments > 0 ? round(($completedAppointments / $totalAppointments) * 100) : 0;
                
            default:
                return 0;
        }
    }

    private function displaySummary(): void
    {
        $this->command->info('=== Analytics Data Summary ===');
        $this->command->info('Total Patient Visits: ' . PatientVisit::count());
        $this->command->info('Total Appointments: ' . Appointment::count());
        $this->command->info('Total Payments: ' . Payment::count());
        $this->command->info('Total Performance Goals: ' . PerformanceGoal::count());
        $this->command->info('Total Goal Snapshots: ' . GoalProgressSnapshot::count());
        
        $revenue = Payment::where('status', 'paid')->sum('amount_paid');
        $this->command->info('Total Revenue: ₱' . number_format($revenue, 2));
        
        $this->command->info('=== Analytics Seeder Complete ===');
    }
}
