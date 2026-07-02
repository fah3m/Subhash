/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _helpers from "../_helpers.js";
import type * as auth from "../auth.js";
import type * as checkIns from "../checkIns.js";
import type * as evidence from "../evidence.js";
import type * as notifications from "../notifications.js";
import type * as sos from "../sos.js";
import type * as timeline from "../timeline.js";
import type * as trustedContacts from "../trustedContacts.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  _helpers: typeof _helpers;
  auth: typeof auth;
  checkIns: typeof checkIns;
  evidence: typeof evidence;
  notifications: typeof notifications;
  sos: typeof sos;
  timeline: typeof timeline;
  trustedContacts: typeof trustedContacts;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
