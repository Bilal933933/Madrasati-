<?php

namespace Database\Seeders;

use App\Domains\Auth\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['admin@example.com' => 'مدير المنصة', 'blalalnjar294@gmail.com' => 'بلال النجار'] as $email => $name) {
            $admin = User::firstOrCreate(['email' => $email], [
                'name' => $name,
                'password' => Hash::make('password'),
            ]);
            // role خارج $fillable عمدًا — تُضبط من السيرفر فقط.
            $admin->role = 'admin';
            $admin->save();
        }

        User::firstOrCreate(['email' => 'student@example.com'], [
            'name' => 'طالب تجريبي',
            'password' => Hash::make('password'),
        ]);
    }
}
