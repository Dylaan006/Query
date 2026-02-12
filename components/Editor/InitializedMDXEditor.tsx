'use client';

import React, { forwardRef } from 'react';
import { MDXEditor, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, markdownShortcutPlugin, MDXEditorMethods } from '@mdxeditor/editor'

const InitializedMDXEditor = forwardRef<MDXEditorMethods, { markdown: string, onChange?: (markdown: string) => void }>(({ markdown, onChange }, ref) => {
    return (
        <div className="prose dark:prose-invert max-w-none note-content">
            <MDXEditor
                ref={ref}
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
});

InitializedMDXEditor.displayName = 'InitializedMDXEditor';
export default InitializedMDXEditor;
