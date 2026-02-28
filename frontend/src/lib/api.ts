const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export type Board = {
  id: string;
  title: string;
  members: string[];
  tags: string[];
  created_by_device_id: string;
  created_at: string;
};

export type Link = {
  id: string;
  url: string;
  title: string;
  image_url: string;
  description: string;
  domain: string;
  category: string;
  added_by: string;
  reactions: Record<string, string[]>;
  created_at: string;
};

export async function createBoard(
  title: string,
  members: string[],
  deviceId: string
): Promise<{ board_id: string }> {
  const res = await fetch(`${getBaseUrl()}/api/boards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, members, device_id: deviceId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to create board");
  }
  return res.json();
}

export async function listMyBoards(
  deviceId: string,
  limit: number = 20
): Promise<Board[]> {
  if (!deviceId) return [];
  const params = new URLSearchParams({
    device_id: deviceId,
    limit: String(limit),
  });
  const res = await fetch(`${getBaseUrl()}/api/me/boards?${params}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getBoard(boardId: string): Promise<Board> {
  const res = await fetch(`${getBaseUrl()}/api/boards/${boardId}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("Board not found");
    throw new Error("Failed to load board");
  }
  return res.json();
}

export async function updateBoard(
  boardId: string,
  body: { title?: string; members?: string[]; tags?: string[] }
): Promise<Board> {
  const res = await fetch(`${getBaseUrl()}/api/boards/${boardId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update board");
  return res.json();
}

export async function listLinks(boardId: string): Promise<Link[]> {
  const res = await fetch(`${getBaseUrl()}/api/boards/${boardId}/links`);
  if (!res.ok) throw new Error("Failed to load links");
  return res.json();
}

export async function createLink(
  boardId: string,
  url: string,
  category: string,
  addedBy: string
): Promise<Link[]> {
  const res = await fetch(`${getBaseUrl()}/api/boards/${boardId}/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, category, added_by: addedBy }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to add link");
  }
  return res.json();
}

export async function deleteLink(
  boardId: string,
  linkId: string
): Promise<void> {
  const res = await fetch(
    `${getBaseUrl()}/api/boards/${boardId}/links/${linkId}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Failed to delete link");
}

export async function toggleReaction(
  boardId: string,
  linkId: string,
  emoji: string,
  member: string
): Promise<Link> {
  const res = await fetch(
    `${getBaseUrl()}/api/boards/${boardId}/links/${linkId}/reactions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji, member }),
    }
  );
  if (!res.ok) throw new Error("Failed to toggle reaction");
  return res.json();
}
