export type UploadRestaurantCoverInput = {
  restaurantId: string;
  file: File | Blob;
};

export type DeleteRestaurantCoverInput = {
  restaurantId: string;
  /** Object key currently stored on the restaurant row. */
  storagePath: string;
};

export type RestaurantCoverResult = {
  path: string;
  publicUrl: string;
};
