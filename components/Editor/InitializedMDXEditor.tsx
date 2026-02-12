'use client';

import React from 'react';
import { MDXEditor, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, markdownShortcutPlugin } from '@mdxeditor/editor'

export default function InitializedMDXEditor({ markdown, onChange }: { markdown: string, onChange?: (markdown: string) => void }) {
    return (
        <div className="prose dark:prose-invert max-w-none">
            <MDXEditor
                markdown={markdown}
                onChange={onChange}
                plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    markdownShortcutPlugin()
                ]}
                contentEditableClassName="outline-none min-h-[500px] text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
            />
        </div>
    );
}
