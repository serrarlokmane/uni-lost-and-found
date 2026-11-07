/**
 * Data-layer tests: every Server Action with a FAKE Supabase client.
 * We check 3 things for each action:
 *   1. it checks the role first (requireApproved / requireAdmin),
 *   2. bad input never reaches the database (rpc is not called),
 *   3. good input calls the right SQL function with exactly the right parameters.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// ---- fakes -------------------------------------------------------------------
const rpc = vi.fn();
const signUp = vi.fn();
const signInWithPassword = vi.fn();
const signOut = vi.fn();
const profileStatus = vi.fn();

vi.mock("@/lib/supabase", () => ({
  createClient: async () => ({
    rpc,
    auth: { signUp, signInWithPassword, signOut },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: profileStatus() }) }),
      }),
    }),
  }),
}));

const requireApproved = vi.fn();
const requireAdmin = vi.fn();
vi.mock("@/lib/auth", () => ({
  requireApproved: () => requireApproved(),
  requireAdmin: () => requireAdmin(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// redirect() in Next.js throws to stop the action; our fake does the same.
class Redirect extends Error {
  constructor(public url: string) {
    super(`redirect:${url}`);
  }
}
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Redirect(url);
  },
}));

const { createPost } = await import("@/app/new/actions");
const { closePost } = await import("@/app/me/actions");
const { createClaim } = await import("@/app/posts/[id]/actions");
const { reviewUser, reviewPost, decideClaim } =
  await import("@/app/admin/actions");
const { signUp: signUpAction, logIn } = await import("@/app/(auth)/actions");

const POST_ID = "b0000000-0000-4000-8000-000000000001";
const today = new Date().toISOString().slice(0, 10);

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  rpc.mockResolvedValue({ data: null, error: null });
  requireApproved.mockResolvedValue({ id: "u1", status: "approved" });
  requireAdmin.mockResolvedValue({ id: "a1", role: "admin" });
});

// ---- F3 create_post ----------------------------------------------------------
describe("createPost (F3)", () => {
  const valid = {
    type: "lost",
    category: "electronics",
    title: "  White earbuds case ",
    description: "White case with a small scratch",
    location: "Library",
    happenedOn: today,
  };

  it("checks the account is approved before anything else", async () => {
    requireApproved.mockRejectedValue(new Redirect("/pending"));
    await expect(createPost({}, form(valid))).rejects.toThrow(
      "redirect:/pending",
    );
    expect(rpc).not.toHaveBeenCalled();
  });

  it("calls create_post with exactly the 6 cleaned parameters", async () => {
    const state = await createPost({}, form(valid));
    expect(rpc).toHaveBeenCalledWith("create_post", {
      p_type: "lost",
      p_category: "electronics",
      p_title: "White earbuds case",
      p_description: "White case with a small scratch",
      p_location: "Library",
      p_happened_on: today,
    });
    expect(state.tone).toBe("success");
  });

  it("never sends invalid input to the database", async () => {
    const state = await createPost(
      {},
      form({ ...valid, category: "weapons", title: "x" }),
    );
    expect(rpc).not.toHaveBeenCalled();
    expect(state.errors?.category).toBeDefined();
    expect(state.errors?.title).toBeDefined();
  });

  it("shows a friendly message for an SQL code, never the DB text", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "rate_limited" } });
    const state = await createPost({}, form(valid));
    expect(state.message).toMatch(/5 posts per day/);
  });
});

// ---- F9 close_post -----------------------------------------------------------
describe("closePost (F9)", () => {
  it("calls close_post with the post id", async () => {
    await closePost(POST_ID, {});
    expect(rpc).toHaveBeenCalledWith("close_post", { p_post_id: POST_ID });
  });
  it("refuses an id that is not a UUID", async () => {
    await closePost("1 or 1=1", {});
    expect(rpc).not.toHaveBeenCalled();
  });
});

// ---- F7 create_claim ---------------------------------------------------------
describe("createClaim (F7)", () => {
  it("calls create_claim with the post id and the trimmed message", async () => {
    await createClaim(
      POST_ID,
      {},
      form({ message: "  3 keys and a red keychain " }),
    );
    expect(rpc).toHaveBeenCalledWith("create_claim", {
      p_post_id: POST_ID,
      p_message: "3 keys and a red keychain",
    });
  });
  it("refuses a message shorter than 10 characters", async () => {
    const state = await createClaim(POST_ID, {}, form({ message: "mine" }));
    expect(rpc).not.toHaveBeenCalled();
    expect(state.errors?.message).toBeDefined();
  });
  it("maps already_claimed to a clear message", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: "already_claimed" },
    });
    const state = await createClaim(
      POST_ID,
      {},
      form({ message: "3 keys and a red keychain" }),
    );
    expect(state.message).toMatch(/already sent a claim/);
  });
});

// ---- F2 / F4 / F8 admin ------------------------------------------------------
describe("admin actions (F2, F4, F8): check #2 of 3", () => {
  it("every admin action calls requireAdmin first", async () => {
    requireAdmin.mockRejectedValue(new Error("NEXT_NOT_FOUND"));
    await expect(reviewUser(POST_ID, "approved", {})).rejects.toThrow();
    await expect(
      reviewPost(POST_ID, "published", {}, form({})),
    ).rejects.toThrow();
    await expect(decideClaim(POST_ID, "accepted", {})).rejects.toThrow();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reviewUser sends only known decisions", async () => {
    await reviewUser(POST_ID, "banned", {});
    expect(rpc).toHaveBeenCalledWith("admin_review_user", {
      p_user_id: POST_ID,
      p_decision: "banned",
    });
    rpc.mockClear();
    await reviewUser(POST_ID, "admin", {});
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reviewPost needs a reason to reject, and trims it", async () => {
    const empty = await reviewPost(
      POST_ID,
      "rejected",
      {},
      form({ reason: "  " }),
    );
    expect(rpc).not.toHaveBeenCalled();
    expect(empty.errors?.reason).toBeDefined();

    await reviewPost(POST_ID, "rejected", {}, form({ reason: " Too vague " }));
    expect(rpc).toHaveBeenCalledWith("admin_review_post", {
      p_post_id: POST_ID,
      p_decision: "rejected",
      p_reason: "Too vague",
    });
  });

  it("reviewPost publishes without a reason", async () => {
    await reviewPost(POST_ID, "published", {}, form({}));
    expect(rpc).toHaveBeenCalledWith("admin_review_post", {
      p_post_id: POST_ID,
      p_decision: "published",
      p_reason: undefined,
    });
  });

  it("decideClaim sends accepted/rejected only", async () => {
    await decideClaim(POST_ID, "accepted", {});
    expect(rpc).toHaveBeenCalledWith("admin_decide_claim", {
      p_claim_id: POST_ID,
      p_decision: "accepted",
    });
    rpc.mockClear();
    await decideClaim(POST_ID, "resolved", {});
    expect(rpc).not.toHaveBeenCalled();
  });
});

// ---- F1 sign-up / login ------------------------------------------------------
describe("signUp (F1)", () => {
  const valid = {
    fullName: "Sara B",
    studentId: "2023-1042",
    email: "Sara@Uni.dz",
    password: "long-enough-1",
  };

  it("sends ONLY full_name and student_id as metadata (a role field is dropped)", async () => {
    signUp.mockResolvedValue({ error: null });
    await expect(
      signUpAction({}, form({ ...valid, role: "admin", status: "approved" })),
    ).rejects.toThrow("redirect:/pending");
    expect(signUp).toHaveBeenCalledWith({
      email: "sara@uni.dz",
      password: "long-enough-1",
      options: { data: { full_name: "Sara B", student_id: "2023-1042" } },
    });
  });

  it("never returns the password to the form", async () => {
    signUp.mockResolvedValue({ error: { code: "email_exists", status: 422 } });
    const state = await signUpAction({}, form(valid));
    expect(state.values).not.toHaveProperty("password");
    expect(state.message).toMatch(/may already be used/);
  });
});

describe("logIn (F1)", () => {
  it("gives the same message for a wrong email or a wrong password", async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { status: 400 },
    });
    const state = await logIn(
      {},
      form({ email: "a@b.dz", password: "whatever" }),
    );
    expect(state.message).toBe("Wrong email or password.");
  });

  it("sends approved users home and the others to /pending", async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: { id: "u1" } },
      error: null,
    });
    profileStatus.mockReturnValue({ status: "approved" });
    await expect(
      logIn({}, form({ email: "a@b.dz", password: "x" })),
    ).rejects.toThrow("redirect:/");
    profileStatus.mockReturnValue({ status: "banned" });
    await expect(
      logIn({}, form({ email: "a@b.dz", password: "x" })),
    ).rejects.toThrow("redirect:/pending");
  });
});
