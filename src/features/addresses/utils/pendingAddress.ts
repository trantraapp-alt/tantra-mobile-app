// One-shot handoff of a newly-created address id from the address form back to
// the listing address selector that opened it. A tiny module singleton keeps it
// simple: the address form `set()`s the new id, and the selector `take()`s it
// once when it regains focus, then it is cleared. The in-progress listing form
// itself survives the round trip because the stack keeps it mounted.
let pending: string | null = null;

// Pending-address handoff facade.
export const pendingAddress = {
  // Records a newly-created address id to auto-select on return.
  set: (addressId: string) => {
    pending = addressId;
  },
  // Reads and clears the pending address id (null when none).
  take: (): string | null => {
    const value = pending;
    pending = null;
    return value;
  },
};
