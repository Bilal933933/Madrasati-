<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * نقطة API محمية ترفض الزائر غير المسجّل (401).
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->withHeader('Accept', 'application/json')->get('/api/user');

        $response->assertUnauthorized();
    }
}
