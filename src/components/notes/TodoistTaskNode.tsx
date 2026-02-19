import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TodoistTaskNode = Node.create({
    name: 'todoistTask',

    group: 'block',

    atom: true,

    addAttributes() {
        return {
            taskId: {
                default: null,
            },
            content: {
                default: 'New Task',
            },
            isCompleted: {
                default: false,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'todoist-task',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['todoist-task', mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(TodoistTaskComponent);
    },
});

const TodoistTaskComponent = ({ node, updateAttributes }: any) => {
    const isCompleted = node.attrs.isCompleted;

    const toggleCompletion = () => {
        updateAttributes({ isCompleted: !isCompleted });
    };

    return (
        <NodeViewWrapper className="my-2">
            <div
                className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all",
                    isCompleted && "opacity-60 bg-zinc-50 dark:bg-zinc-900/50"
                )}
            >
                <button
                    onClick={toggleCompletion}
                    className={cn(
                        "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors",
                        isCompleted && "text-green-500 hover:text-green-600"
                    )}
                >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>
                <div className="flex-1">
                    <span className={cn("text-sm", isCompleted && "line-through text-zinc-500")}>
                        {node.attrs.content}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] uppercase font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1 py-0.5 rounded">
                            Todoist
                        </span>
                    </div>
                </div>
            </div>
        </NodeViewWrapper>
    );
};
