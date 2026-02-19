'use server';

import { TodoistApi } from "@doist/todoist-api-typescript";

const getApiToken = () => {
    const token = process.env.TODOIST_API_TOKEN || process.env.NEXT_PUBLIC_TODOIST_API_TOKEN;
    return token ? token.trim() : undefined;
};

export async function getTasks() {
    const token = getApiToken();
    if (!token) {
        console.error("Todoist Token Missing");
        return [];
    }

    console.log("Fetching tasks via fetch with token prefix:", token.substring(0, 4) + "...");

    try {
        const response = await fetch("https://api.todoist.com/api/v2/tasks", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store' // Ensure we get fresh data
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Todoist fetch status:", response.status, "Data type:", Array.isArray(data) ? "Array" : typeof data);

        if (!Array.isArray(data)) {
            console.error("Unexpected Todoist response format (fetch):", data);
            return [];
        }

        return data.map((task: any) => ({
            id: task.id,
            content: task.content,
            projectId: task.project_id,
            sectionId: task.section_id, // Add sectionId
            priority: task.priority,
            due: task.due,
            description: task.description,
            labels: task.labels
        }));
    } catch (error: any) {
        console.error("Error fetching tasks from Todoist:", error?.message || error);
        throw new Error(`Failed to fetch tasks: ${error?.message}`);
    }
}

// ... existing getProjects ...

export async function getSections(projectId: string) {
    const token = getApiToken();
    if (!token) return [];

    try {
        const response = await fetch(`https://api.todoist.com/api/v2/sections?project_id=${projectId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) return [];

        return data.map((section: any) => ({
            id: section.id,
            projectId: section.project_id,
            name: section.name,
            order: section.order
        }));
    } catch (error: any) {
        console.error("Error fetching sections:", error?.message || error);
        return [];
    }
}

export async function getProjects() {
    const token = getApiToken();
    if (!token) return [];

    try {
        const response = await fetch("https://api.todoist.com/api/v2/projects", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
        });
        // ... (rest of getProjects)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) return [];

        return data.map((project: any) => ({
            id: project.id,
            name: project.name,
            color: project.color,
            isInbox: project.is_inbox_project
        }));
    } catch (error: any) {
        console.error("Error fetching projects:", error?.message || error);
        return [];
    }
}

export async function createTask(content: string, projectId?: string, description?: string, priority?: number, dueDate?: string | null, sectionId?: string) {
    const token = getApiToken();
    if (!token) {
        throw new Error("Todoist Token Missing");
    }

    try {
        const body: any = { content };
        if (projectId) body.project_id = projectId;
        if (sectionId) body.section_id = sectionId;
        if (description) body.description = description;
        if (priority) body.priority = priority;
        if (dueDate) body.due_string = dueDate;

        const response = await fetch("https://api.todoist.com/api/v2/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "X-Request-Id": crypto.randomUUID(),
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const task = await response.json();
        return {
            id: task.id,
            content: task.content,
            projectId: task.project_id,
            sectionId: task.section_id,
            priority: task.priority,
            due: task.due,
            description: task.description,
            labels: task.labels
        };
    } catch (error: any) {
        console.error("Error creating task:", error?.message || error);
        throw new Error("Failed to create task");
    }
}

export async function closeTask(taskId: string) {
    const token = getApiToken();
    if (!token) {
        throw new Error("Todoist Token Missing");
    }

    try {
        const response = await fetch(`https://api.todoist.com/api/v2/tasks/${taskId}/close`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok && response.status !== 204) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return true;
    } catch (error: any) {
        console.error("Error closing task:", error?.message || error);
        throw new Error("Failed to close task");
    }
}

export async function updateTask(taskId: string, args: { content?: string; description?: string; priority?: number; dueDate?: string | null; projectId?: string; sectionId?: string }) {
    const token = getApiToken();
    if (!token) {
        throw new Error("Todoist Token Missing");
    }

    try {
        const body: any = {};
        if (args.content !== undefined) body.content = args.content;
        if (args.description !== undefined) body.description = args.description;
        if (args.priority !== undefined) body.priority = args.priority;
        if (args.dueDate !== undefined) body.due_date = args.dueDate;
        if (args.projectId !== undefined) body.project_id = args.projectId;
        if (args.sectionId !== undefined) body.section_id = args.sectionId;

        // Special handling for removing due date if null is passed
        if (args.dueDate === null) {
            body.due_string = "no date";
            delete body.due_date;
        }

        const response = await fetch(`https://api.todoist.com/api/v2/tasks/${taskId}`, {
            method: "POST", // Update is POST to /tasks/:id
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "X-Request-Id": crypto.randomUUID(),
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const task = await response.json();
        return {
            id: task.id,
            content: task.content,
            projectId: task.project_id,
            sectionId: task.section_id,
            priority: task.priority,
            due: task.due,
            description: task.description,
            labels: task.labels
        };
    } catch (error: any) {
        console.error("Error updating task:", error?.message || error);
        throw new Error("Failed to update task");
    }
}

export async function deleteTask(taskId: string) {
    const token = getApiToken();
    if (!token) {
        throw new Error("Todoist Token Missing");
    }

    try {
        const response = await fetch(`https://api.todoist.com/api/v2/tasks/${taskId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok && response.status !== 204) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return true;
    } catch (error: any) {
        console.error("Error deleting task:", error?.message || error);
        throw new Error("Failed to delete task");
    }
}
