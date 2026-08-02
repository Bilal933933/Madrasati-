<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| مُجمِّع مسارات الـ Domains
|--------------------------------------------------------------------------
| routes/api.php مجرد ملف تجميع: يستدعي ملف routes.php الخاص بكل دومين.
| كل دومين يحمل مساراته الخاصة به داخل app/Domains/{Domain}/routes.php
*/

require base_path('app/Domains/Auth/routes.php');
