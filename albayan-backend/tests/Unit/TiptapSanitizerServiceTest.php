<?php

namespace Tests\Unit;

use App\Support\TiptapSanitizerService;
use PHPUnit\Framework\TestCase;

class TiptapSanitizerServiceTest extends TestCase
{
    private function sanitize(string $json): string
    {
        return (new TiptapSanitizerService)->sanitize($json);
    }

    /** يعيد `true` إذا كان المستند فارغًا بلا عقد. */
    private function isEmptyDoc(string $json): bool
    {
        $decoded = json_decode($json, true);

        return ($decoded['type'] ?? null) === 'doc'
            && ($decoded['content'] ?? []) === [];
    }

    public function test_it_keeps_a_diagram_node_with_content(): void
    {
        $json = '{"type":"doc","content":[{"type":"diagram","attrs":{"content":"flowchart TD\\nA --> B"}}]}';

        $result = $this->sanitize($json);

        $this->assertStringContainsString('"type":"diagram"', $result);
        $this->assertStringContainsString('"content":"flowchart TD', $result);
    }

    public function test_it_drops_a_diagram_node_without_content(): void
    {
        $json = '{"type":"doc","content":[{"type":"diagram"}]}';

        $result = $this->sanitize($json);

        $this->assertTrue($this->isEmptyDoc($result));
    }

    public function test_it_drops_a_diagram_node_with_non_string_content(): void
    {
        $json = '{"type":"doc","content":[{"type":"diagram","attrs":{"content":["flowchart"]}}]}';

        $result = $this->sanitize($json);

        $this->assertTrue($this->isEmptyDoc($result));
    }

    public function test_it_strips_unknown_attributes_from_a_diagram_node(): void
    {
        $json = '{"type":"doc","content":[{"type":"diagram","attrs":{"content":"flowchart LR","onclick":"alert(1)"}}]}';

        $result = $this->sanitize($json);

        $this->assertStringNotContainsString('onclick', $result);
        $this->assertStringContainsString('"content":"flowchart LR"', $result);
    }

    public function test_it_drops_a_diagram_node_with_too_long_content(): void
    {
        $long = str_repeat('A', 20_001);
        $json = '{"type":"doc","content":[{"type":"diagram","attrs":{"content":"'.$long.'"}}]}';

        $result = $this->sanitize($json);

        $this->assertTrue($this->isEmptyDoc($result));
    }

    public function test_it_keeps_a_diagram_alongside_other_nodes(): void
    {
        $json = '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"شرح"}]},{"type":"diagram","attrs":{"content":"pie title X\\n\\"a\\" : 1"}}]}';

        $result = $this->sanitize($json);

        $this->assertStringContainsString('"text":"شرح"', $result);
        $this->assertStringContainsString('"type":"diagram"', $result);
    }
}
