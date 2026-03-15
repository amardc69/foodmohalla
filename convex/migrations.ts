import { internalMutation } from "./_generated/server";

export const scrubStorageIds = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Scrub categories
    const categories = await ctx.db.query("categories").collect();
    for (const cat of categories) {
      if ((cat as any).storageId !== undefined) {
        await ctx.db.replace(cat._id, {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          icon: cat.icon,
        });
      }
    }

    // Scrub menuItems
    const menuItems = await ctx.db.query("menuItems").collect();
    for (const item of menuItems) {
      if ((item as any).storageId !== undefined) {
        await ctx.db.replace(item._id, {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          category: item.category,
          rating: item.rating,
          isVeg: item.isVeg,
          isSizeBased: item.isSizeBased,
          isHot: item.isHot,
          badge: item.badge,
          sizes: item.sizes,
          addons: item.addons,
          discount: item.discount,
          isOutOfStock: item.isOutOfStock,
          isBestSeller: item.isBestSeller,
          isFeatured: item.isFeatured,
          calories: item.calories,
          instructions: item.instructions,
        });
      }
    }
  },
});
