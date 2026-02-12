'use client';

import dynamic from 'next/dynamic';

const InitializedMDXEditor = dynamic(
    () => import('./InitializedMDXEditor'),
    { ssr: false }
);

export default function MDXEditorComponent({ markdown, onChange }: { markdown: string, onChange?: (markdown: string) => void }) {
    return <InitializedMDXEditor markdown={markdown} onChange={onChange} />;
}
