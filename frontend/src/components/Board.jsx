import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { Plus, Trash2, Layout, LogOut, MoreHorizontal, X, FolderKanban } from "lucide-react";

export default function Board() {
  const {
    tasks, workspaces, activeWorkspace, fetchWorkspaces, createWorkspace, setActiveWorkspace,
    addTask, updateTaskStatus, updateTaskPriority, updateTaskDetails, deleteTask, logout,
  } = useStore();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [dragOver, setDragOver] = useState(null);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = (e, status) => {
    const taskId = e.dataTransfer.getData("taskId");
    updateTaskStatus(taskId, status);
    setDragOver(null);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activeWorkspace) return;

    addTask({
      title: newTaskTitle,
      priority: "MEDIUM",
      workspaceId: activeWorkspace._id
    });
    setNewTaskTitle("");
  };

  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    createWorkspace(newWorkspaceName);
    setNewWorkspaceName("");
    setIsCreatingWorkspace(false);
  };

  const handlePriorityClick = (e, taskId, currentPriority) => {
    e.stopPropagation();
    const nextPriority = currentPriority === "LOW" ? "MEDIUM" : currentPriority === "MEDIUM" ? "HIGH" : "LOW";
    updateTaskPriority(taskId, nextPriority);
  };

  const openModal = (task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || "");
  };

  const saveTaskDetails = () => {
    updateTaskDetails(selectedTask._id, { title: editTitle, description: editDesc });
    setSelectedTask(null);
  };

  const columns = [
    { id: "TODO", title: "To Do", color: "bg-slate-100" },
    { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-50" },
    { id: "DONE", title: "Done", color: "bg-green-50" },
  ];

  const priorityColors = {
    LOW: "bg-blue-100 text-blue-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-800">

      <div className="w-64 min-w-[256px] flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-gray-200">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Layout size={20} />
          </div>
          <h1 className="text-xl font-bold">Jira Clone</h1>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Workspaces</p>
            <button
              onClick={() => setIsCreatingWorkspace(!isCreatingWorkspace)}
              className="text-gray-400 hover:text-blue-600 transition"
            >
              <Plus size={16} />
            </button>
          </div>

          {isCreatingWorkspace && (
            <form onSubmit={handleCreateWorkspace} className="mb-4">
              <input
                type="text"
                autoFocus
                placeholder="Workspace name..."
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white text-xs font-bold py-1.5 rounded hover:bg-blue-700">Save</button>
                <button type="button" onClick={() => setIsCreatingWorkspace(false)} className="flex-1 bg-gray-200 text-gray-700 text-xs font-bold py-1.5 rounded hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          )}

          <div className="flex flex-col gap-1">
            {workspaces.map(ws => (
              <button
                key={ws._id}
                onClick={() => setActiveWorkspace(ws)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeWorkspace?._id === ws._id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-200/50"
                  }`}
              >
                <FolderKanban size={16} />
                <span className="truncate">{ws.name}</span>
              </button>
            ))}
            {workspaces.length === 0 && !isCreatingWorkspace && (
              <p className="text-xs text-gray-400 italic px-2">No workspaces yet.</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button onClick={logout} className="flex items-center gap-2 text-gray-600 hover:text-red-600 w-full px-4 py-2 transition font-medium">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
        <header className="h-16 border-b border-gray-200 flex items-center px-8 bg-white relative">
          <h2 className="text-xl font-semibold absolute left-1/2 -translate-x-1/2">
            {activeWorkspace ? activeWorkspace.name : "Select a Workspace"}
          </h2>
        </header>

        <main className="flex-1 flex flex-col p-8 overflow-hidden bg-slate-50">

          {!activeWorkspace ? (
            <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
              <FolderKanban size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium text-gray-600">No workspace selected</p>
              <p className="text-sm">Create or select a workspace from the sidebar to start.</p>
            </div>
          ) : (
            <>
              <form
                onSubmit={handleAddTask}
                className="mb-6 flex items-center w-full gap-4"
              >
                <input
                  type="text"
                  placeholder="Create new task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </form>

              <div className="flex gap-[3.5rem] flex-1 overflow-x-auto pb-4 w-full items-stretch">
                {columns.map((col) => (
                  <div
                    key={col.id}
                    className={`flex flex-col rounded-xl border border-gray-200 min-w-[320px] max-w-[350px] flex-1 transition-all ${col.color} ${dragOver === col.id ? "ring-2 ring-blue-400 bg-blue-50/50" : ""
                      }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(col.id); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => handleDrop(e, col.id)}
                  >
                    <div className="p-3 border-b border-gray-200/60 flex justify-between items-center bg-black/5 rounded-t-xl">
                      <h3 className="font-semibold text-gray-700">{col.title}</h3>
                      <span className="text-xs font-bold text-gray-600 bg-black/10 px-2 py-1 rounded-full">
                        {tasks.filter((t) => t.status === col.id).length}
                      </span>
                    </div>

                    <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 custom-scrollbar">
                      {tasks.filter((t) => t.status === col.id).map((task) => (
                        <div
                          key={task._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task._id)}
                          onClick={() => openModal(task)}
                          className="select-none bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <p className="text-gray-800 text-sm font-medium leading-snug break-words">
                              {task.title}
                            </p>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }}
                              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                            <button
                              onClick={(e) => handlePriorityClick(e, task._id, task.priority || "MEDIUM")}
                              className={`text-[10px] font-bold px-2 py-1 rounded w-fit hover:ring-2 ring-offset-1 transition-all ${priorityColors[task.priority || "MEDIUM"]}`}
                            >
                              {task.priority || "MEDIUM"}
                            </button>
                            <MoreHorizontal size={16} className="text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Edit Task</h2>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-700 transition">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <label className="block text-sm font-bold mb-2 text-gray-700">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 font-medium"
              />

              <label className="block text-sm font-bold mb-2 text-gray-700">Description</label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Add a more detailed description..."
                className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
              />
            </div>

            <div className="p-6 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setSelectedTask(null)} className="px-5 py-2 font-medium text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button onClick={saveTaskDetails} className="px-5 py-2 bg-blue-600 font-medium text-white rounded hover:bg-blue-700 shadow-sm transition">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}