import dynamic from 'next/dynamic';
import { MDXEditorMethods } from '@mdxeditor/editor';
import { forwardRef } from 'react';

const InitializedMDXEditor = dynamic(
    () => import('./InitializedMDXEditor'),
    { ssr: false }
);

const MDXEditorComponent = forwardRef<MDXEditorMethods, { markdown: string, onChange?: (markdown: string) => void }>(({ markdown, onChange }, ref) => {
    return <InitializedMDXEditor markdown={markdown} onChange={onChange} ref={ref} />;
});

MDXEditorComponent.displayName = 'MDXEditorComponent';
export default MDXEditorComponent;
