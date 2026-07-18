import { NextResponse } from "next/server";

import { createClient } from "@/src/lib/supabase/server";

type RouteContext = {
  params: Promise<{ groupId: string }>;
};

const STORAGE_BUCKET = "yum-diary";
const STORAGE_REMOVE_CHUNK_SIZE = 100;

function errorResponse(message: string, status: number) {
  return NextResponse.json({ data: null, error: message }, { status });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { groupId: rawGroupId } = await context.params;
  const groupId = rawGroupId?.trim();

  if (!groupId) {
    return errorResponse("Missing group id", 400);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return errorResponse("Not authenticated", 401);
  }

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, name, owner_id")
    .eq("id", groupId)
    .eq("is_archived", false)
    .maybeSingle();

  if (groupError) {
    return errorResponse("Failed to load group", 500);
  }

  if (!group) {
    return errorResponse("Group not found", 404);
  }

  if (group.owner_id !== user.id) {
    return errorResponse("Only group owner can delete group", 403);
  }

  const { error: preflightError } = await supabase.rpc("hard_delete_group", {
    p_group_id: groupId,
    p_dry_run: true,
  });

  if (preflightError) {
    return errorResponse("Group deletion is not available", 500);
  }

  const { data: restaurants, error: restaurantsError } = await supabase
    .from("restaurants")
    .select("id, restaurant_cover_path")
    .eq("group_id", groupId);

  if (restaurantsError) {
    return errorResponse("Failed to load restaurant data", 500);
  }

  const restaurantIds = (restaurants ?? []).map((row) => row.id);
  const storagePaths = new Set<string>();

  for (const restaurant of restaurants ?? []) {
    if (restaurant.restaurant_cover_path?.trim()) {
      storagePaths.add(restaurant.restaurant_cover_path.trim());
    }
  }

  let recordIds: string[] = [];

  if (restaurantIds.length > 0) {
    const [restaurantPhotosResult, menuPhotosResult, recordsResult] =
      await Promise.all([
        supabase
          .from("restaurant_photos")
          .select("storage_path")
          .in("restaurant_id", restaurantIds),
        supabase
          .from("menu_photos")
          .select("storage_path")
          .in("restaurant_id", restaurantIds),
        supabase
          .from("records")
          .select("id")
          .in("restaurant_id", restaurantIds),
      ]);

    if (
      restaurantPhotosResult.error ||
      menuPhotosResult.error ||
      recordsResult.error
    ) {
      return errorResponse("Failed to load group photo data", 500);
    }

    for (const photo of restaurantPhotosResult.data ?? []) {
      storagePaths.add(photo.storage_path);
    }

    for (const photo of menuPhotosResult.data ?? []) {
      storagePaths.add(photo.storage_path);
    }

    recordIds = (recordsResult.data ?? []).map((row) => row.id);
  }

  if (recordIds.length > 0) {
    const { data: recordPhotos, error: recordPhotosError } = await supabase
      .from("record_photos")
      .select("storage_path")
      .in("record_id", recordIds);

    if (recordPhotosError) {
      return errorResponse("Failed to load diary photo data", 500);
    }

    for (const photo of recordPhotos ?? []) {
      storagePaths.add(photo.storage_path);
    }
  }

  const paths = [...storagePaths].filter(Boolean);

  for (
    let offset = 0;
    offset < paths.length;
    offset += STORAGE_REMOVE_CHUNK_SIZE
  ) {
    const chunk = paths.slice(offset, offset + STORAGE_REMOVE_CHUNK_SIZE);
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(chunk);

    if (storageError) {
      return errorResponse("Failed to delete group storage", 500);
    }
  }

  const { data: nextGroupId, error: deleteError } = await supabase.rpc(
    "hard_delete_group",
    { p_group_id: groupId, p_dry_run: false },
  );

  if (deleteError) {
    return errorResponse("Failed to delete group", 500);
  }

  return NextResponse.json({
    data: {
      deletedGroupName: group.name,
      nextGroupId: nextGroupId ?? null,
    },
    error: null,
  });
}
