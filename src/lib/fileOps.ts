import { api } from "./api";
import { useStore } from "../store/useStore";

async function refreshHistory() {
  const history = await api.getHistory();
  useStore.getState().setHistory(history);
}

export async function openFile() {
  const result = await api.openFileDialog();
  if (!result) return;
  useStore.getState().openFile(result.path, result.name, result.content);
  await api.addToHistory(result.path, result.name);
  await refreshHistory();
}

export async function saveFile() {
  const { content, filePath, fileName, markSaved } = useStore.getState();
  if (filePath) {
    await api.writeFile(filePath, content);
    markSaved(filePath, fileName);
  } else {
    await saveFileAs();
  }
}

export async function saveFileAs() {
  const { content, fileName, markSaved } = useStore.getState();
  const path = await api.saveFileDialog(content, fileName);
  if (!path) return;
  const name = path.split("/").pop() || fileName;
  markSaved(path, name);
  await api.addToHistory(path, name);
  await refreshHistory();
}
