<?php

namespace App\Support;

/**
 * تعقيم محتوى الفقرة القادم من محرر TipTap بصيغة JSON.
 *
 * يتحقق من البنية (مستند doc + عقد مسموحة فقط) ويجرّد أي عقدة مجهولة
 * أو علامات غير مسموحة، ثم يعيد JSON نظيفًا. يحمي الباك حتى من المدخلات
 * التي يرسلها محرر مخترق، ويمنع تخزين نصوص HTML خام داخل JSON.
 */
class TiptapSanitizerService
{
    /** العقد المسموحة من بنية TipTap (StarterKit). */
    private const ALLOWED_NODES = [
        'doc',
        'paragraph',
        'heading',
        'bulletList',
        'orderedList',
        'listItem',
        'blockquote',
        'text',
        'hardBreak',
    ];

    /** العلامات (Marks) المسموحة داخل نص. */
    private const ALLOWED_MARKS = [
        'bold',
        'italic',
        'strike',
    ];

    /** أقصى عمق للشجرة، وأقصى طول للمستند. */
    private const MAX_DEPTH = 12;

    private const MAX_LENGTH = 200_000;

    /**
     * يعقّم سلسلة JSON قادمة من TipTap ويعيد نسخة نظيفة منها.
     * القيم غير الصالحة تُستبدل بمستند فارغ (doc بلا محتوى).
     */
    public function sanitize(string $json): string
    {
        try {
            $doc = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return $this->emptyDoc();
        }

        if (! is_array($doc)) {
            return $this->emptyDoc();
        }

        $cleaned = $this->cleanNode($doc, 0);

        if (! is_array($cleaned) || ($cleaned['type'] ?? null) !== 'doc') {
            return $this->emptyDoc();
        }

        return json_encode($cleaned, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: $this->emptyDoc();
    }

    /**
     * يكرّر على عقدة واحدة: يبقيها إن كانت من القائمة المسموحة،
     * وينظّف أطفالها ومحتواها النصي، ويرجع `null` للعقد المجهولة.
     */
    private function cleanNode(mixed $node, int $depth): mixed
    {
        if (! is_array($node) || $depth > self::MAX_DEPTH) {
            return null;
        }

        $type = $node['type'] ?? null;
        if (! is_string($type) || ! in_array($type, self::ALLOWED_NODES, true)) {
            return null;
        }

        $clean = ['type' => $type];

        if ($type === 'text') {
            $text = is_string($node['text'] ?? null) ? $node['text'] : '';
            if (strlen($text) > self::MAX_LENGTH) {
                return null;
            }
            $clean['text'] = $text;

            if (isset($node['marks']) && is_array($node['marks'])) {
                $marks = [];
                foreach ($node['marks'] as $mark) {
                    $markType = $mark['type'] ?? null;
                    if (is_string($markType) && in_array($markType, self::ALLOWED_MARKS, true)) {
                        $marks[] = ['type' => $markType];
                    }
                }
                if ($marks !== []) {
                    $clean['marks'] = $marks;
                }
            }

            return $clean;
        }

        if ($type === 'heading') {
            $level = $node['attrs']['level'] ?? null;
            if (is_int($level) && in_array($level, [1, 2, 3], true)) {
                $clean['attrs'] = ['level' => $level];
            }
        }

        if (isset($node['content']) && is_array($node['content'])) {
            $children = [];
            foreach ($node['content'] as $child) {
                $cleanedChild = $this->cleanNode($child, $depth + 1);
                if ($cleanedChild !== null) {
                    $children[] = $cleanedChild;
                }
            }
            if ($children !== []) {
                $clean['content'] = $children;
            }
        }

        return $clean;
    }

    /** مستند فارغ سليم البنية — تُرجع عند تعذّر التحليل. */
    private function emptyDoc(): string
    {
        return json_encode(['type' => 'doc', 'content' => []], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{"type":"doc","content":[]}';
    }
}
