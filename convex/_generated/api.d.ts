/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as addresses from "../addresses.js";
import type * as adminSettings from "../adminSettings.js";
import type * as cart from "../cart.js";
import type * as categories from "../categories.js";
import type * as favourites from "../favourites.js";
import type * as init from "../init.js";
import type * as menu from "../menu.js";
import type * as migrations from "../migrations.js";
import type * as offers from "../offers.js";
import type * as orders from "../orders.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  addresses: typeof addresses;
  adminSettings: typeof adminSettings;
  cart: typeof cart;
  categories: typeof categories;
  favourites: typeof favourites;
  init: typeof init;
  menu: typeof menu;
  migrations: typeof migrations;
  offers: typeof offers;
  orders: typeof orders;
  users: typeof users;
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
