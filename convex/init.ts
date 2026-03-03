import { mutation } from "./_generated/server";

const initialCategories = [
  {
    name: "Burgers",
    slug: "burgers",
    description: "Juicy & Cheesy",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3KnqwvwFjvpva7hlriqF6dRziTc4jbQyH9yWdt65CBFaQRqQbd6joL97plgPjL3FHk-7LRFjToSLGcdv4JHu7TG83kR0ifnwZDoq5UAyIZO9qdqxjOhdo46GhxJdicKxxPoEslu6S8sinJVNcHBDWitjkQV3eCvWKlf0qG24M3FNZvEOUCKChnfMhkC6ov2wvjxOZivHVNYd3FGEn-8-xmg0c0vJNsP3HHdRjml-7yAz2O3Y83le_sotXbD2sJTfeO92kmysDh3Gu",
    icon: "lunch_dining",
  },
  {
    name: "Pizza",
    slug: "pizza",
    description: "Hot & Fresh",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuClMj66XF4HJM3DgrP0mNLPcQkvaTv6TcNzsCxRD1gfT9Icz48eNZ8wm8jvHBjz2rzW0Jg3bpetEZR9ARfFpqBwwvZpgcTdDWMnqb3yVcQFSFWl9mPl46G3F9J6tO5GSh9D3DLozp4O64PZvSUpvw2G7xlolLiBxLOweiXE4xwArIJm7eliTBeXUsTA3Gac9FjQ-IMPpIIEBvAPEwlYZnJsM2db4JBawlmdrkXGWLaF31xJn6Qi-Gt4Ejcq-M-FYc7XDP3B-DUK3pLm",
    icon: "local_pizza",
  },
  {
    name: "Desi",
    slug: "desi",
    description: "Authentic Flavors",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5Tcf-hyraSMn4cekJD__2VdqH5qXSetb-68ZjF8qkJT5CzXDVO8xqsA_MOfHp4emi-B-aNaqBGCDnrJyKKq3Bu-JNTOdAmeV23CS23_a-WaGwIJx_KH0ovrZYtFcc3wrd2IV2Dn5hQIukBk2XoDBV94WxKZmyvkLhmCm5xxZWqWbPvUpPF-NNG1uT83FR1_LPgp_Xa90b3WFiTmar0mYV8DcZjp1wWUb7nnUzhO29khbzVAgGw3mfWxagbjlHWey4rPZlCnpQEEgu",
    icon: "restaurant",
  },
  {
    name: "Desserts",
    slug: "desserts",
    description: "Sweet Treats",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIxR5NG9rwSyxOgKABTILDzgr1HpdsJXSEs4P9nXKWoM4RyvhwP9xVam1spIMnp6q9u8GdAELnaaSOpvdrBcSu1i83xBvMOKgH95XlTUYAwtPlgmlTOmb5p5yvF_7RRIEedSOBq55_wcVQB6gkdEEPMbb4EUkQymZHcUjS-0zI_9cpNjR2XRE7Lco17HFUdGwJbFN66cN1CXdcdwr4fmzLyvaLoQNJETOVavhwZWF7QqYqj8LMDJpLDr9YfL_w7_H2c3VqbZbmotb8",
    icon: "icecream",
  },
];

const initialMenuItems = [
  {
    id: "classic-cheeseburger",
    name: "Classic Cheeseburger",
    description: "Premium beef patty topped with cheddar cheese, fresh lettuce, tomato, and house sauce.",
    price: 12.99,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCAZfT2SK1I6btlaX19A3Pfw349Un6hBI7xg-dZZUIOMOxxhL1dVJxwbCNlaHud9tVIEMOg_zkIZObA22bJN7rxoWB06kEYhHgbB9wMiqh5pSk7CRv7Te_OWsfomHdLzGMGU7LxPJD9c64IOQaSqMwOm-HphTnFoHglXJL3liAqRMWdlNX937JfFc1y18RNFzlGtnN_iNYVL3fpbgQYVwSMXdAwrzsLWRwwZgWiDyzUxVFDMtyDoCJT9Kmr-DPWtxtznngiCaLYGxjH",
    category: "burgers",
    rating: 4.8,
    isVeg: false,
  },
  {
    id: "spicy-chicken-zinger",
    name: "Spicy Chicken Zinger",
    description: "Crispy fried chicken breast with spicy mayo, jalapeños, and lettuce on a sesame bun.",
    price: 10.49,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOemJQBkZL7zWYCsp3nDjQ0hY-h7rRjDd3TI8umIfSJVyV_JjpKpHfQWWedmXgUYeOpU2r9iMVv8HB3Cj6NmFJVXeoh9FX70W0CFD11a-iU71RkNelu_ChS8r9tIkU_xNjIQel58oLWgDjlxxcUZINyVSodCOqSKbz8HNFr5Jjxk03ItTIzdCcPkUdy4gQOBRvhnEgiNuUYM0cVWloyb0PVxRq7-ksbKgVb3D5_t3bsXVXZfcfIDaorAIC30Wzf-Cll_nsPa2_TckS",
    category: "burgers",
    rating: 4.5,
    isVeg: false,
    isHot: true,
    badge: "HOT",
  },
  {
    id: "veggie-supreme",
    name: "Veggie Supreme",
    description: "Plant-based patty with fresh avocado, spinach, tomato, and vegan aioli.",
    price: 14.99,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGTdXDz4ChRz6PVSAjHpmKMF536CTi0QdJbPZXNOQl2kVZ_qkaEraTB5AzusTaerI7UzCv6E_jYJZ6L6RxvZB6_qRRRr-d0RJcmvZrdGeACiCxmLTwJT5Z8ItW7EWRy3sPszjSsYpXiaSgNBV79B9zNbqpF8_P9TVIbAJmXHMfZBJO9-1acDBZLZ2IZfBvO1Vfe3gS9SkBIMv0LslGIblJWoRCoXAhLPuuTnDX3KCk4ZD7bfvMQ_x48_cx_wTbQcryTZblM9iTO6yX",
    category: "burgers",
    rating: 4.2,
    isVeg: true,
    badge: "VEG",
  },
  {
    id: "maharaja-paneer-burger",
    name: "Maharaja Paneer Burger",
    description: "A royal treat with a double patty of spicy grilled paneer, fresh iceberg lettuce, tomatoes, caramelized onions, and our signature tandoori mayo sauce.",
    price: 12.99,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxUphr-_eKjnScvSFrh1M2kfpvZResG4hJkqykRAlNGZhbL1WDtr6IE54p5XRq8L85WC96zIRh7BAYj97NGXRZRmZ2oiBbpruiY9hRKFOdA6nMzmZ-YRsMZ_IfC7LVdZKRf3L64OLhArwGtCGN4RtXk590N91drzuCkXTehcffhqffVvNEm-EScN-QcRyd0uM-Y4Kg1wwkEKst3blySpxq6Cvpu_VaMCkFvQiPH7-BzEhUpLDglnxDjcKrTpSRqeAfIA28aoDteR23",
    category: "burgers",
    rating: 4.8,
    isVeg: true,
    badge: "VEG",
  },
  {
    id: "pepperoni-feast",
    name: "Pepperoni Feast",
    description: "Loaded with double pepperoni, mozzarella cheese, and our signature tomato sauce.",
    price: 16.5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3qYcJEBJBMQ8r3ySgQ23TX0jZMwmdzBkMlW8V3foq_8mSMIzSImvE4ogSkEvl_Mh9ILHwCoD1YZAiQDfOKdN_TfOQaAEZkgJy4BM_--Wm5W3XBcNvxVAsIW4bqs7rhlmnO5WcVoym390EWASt9ho7wvOijXEWgHDGc6pegOnBHT-oohzKzZzI0Lu_0kERvEOUJ6B34DbXMWKi8AFGBblBKIIf0HYMTjwYafBeB3SJXRU-VAXmvhrPnXTvfxjxrvFVPLdZ2qomIB2e",
    category: "pizza",
    rating: 4.9,
    isVeg: false,
  },
  {
    id: "classic-margherita",
    name: "Classic Margherita",
    description: "Fresh tomatoes, mozzarella cheese, and fresh basil on a thin crust.",
    price: 13.0,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCf478mfUNEF2JMxEgQFvmQ1DRrEn2_aOKol8IiKcZvfdsJ-yt29SfgQk7-0xeLzDHdbmFXzgoM6LhUA54N5InE6dnuTsbA0qVyJ4yp22TMGLUGoCGbDRgNds8uGCjnCIhPL8ish3k9USZju_Cl41eUEeMAk04mK9vJaNAMDcGnyF4y7ed40UqiT_JMvf7Ki1mjcWtOBW5vjY2xS4IZSE9HHNjbPw681Q-EPYT0ZKrIBXs4bVExb2F46WnB6Cobf_MGSn0li0mAsptr",
    category: "pizza",
    rating: 4.7,
    isVeg: true,
    badge: "VEG",
  },
  {
    id: "bbq-chicken",
    name: "BBQ Chicken",
    description: "Grilled chicken, red onions, cilantro, and tangy BBQ sauce.",
    price: 15.5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBe3ae1KNduWMqojVvAmY-quSh3RFxWouyWOE_3Rh8CRHudptHK6aEflLLYC28OXT_BROlgI_cU7b0XKO1pfsvXwzztrgkyQOGlVfi9ar_l-3Aj47B7MmmhUWXha0trP31M7cvWemUcr_aOAwa8OZ_pUAehXfL6CqzHgzzNDRcaKj9HHOodcOlDjdhl6kWzZHze876Mf5NyE9viA3upJU_PEIdz6EowZrOHNxoJrhWRNlZLCpdIaOFHKsW6SqYi7y7Tp4L4sihTkndQ",
    category: "pizza",
    rating: 4.6,
    isVeg: false,
  },
  {
    id: "golden-fries",
    name: "Golden Fries",
    description: "Crispy salted fries, served hot with ketchup.",
    price: 4.99,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEHNG5UDwCsD5aD8ybwGM1aSlImlssiGdXbC_9J4A6u2yFRv8ENaAHNkSr2EAuB_jnuG-_mr8-fRlkpnuzUFRkYFxGvhN0c-8Ib0oQohLwyNGoqQpQdJLQqmEibWmde_xVQK8vebNbnWS9B_jKFP3RvB3KicmKdiWSsahPjophGW5cdM6aJ2r5r-GFnzLxt-SBK8npKX1usUJkTWIiGVPv_RhwgKFliTZ4jwN35PEXX8vptp0uyAfk6cBjSAOzi0w1SI_dENFZP7Rl",
    category: "sides",
    rating: 4.5,
    isVeg: true,
    badge: "VEG",
  },
  {
    id: "onion-rings",
    name: "Onion Rings",
    description: "Thick-cut onion rings battered and fried to perfection.",
    price: 5.99,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmqtcO0s86E1lNASN2XV7Vyyy7XdlkacHYxFHae3aMLUwQWFkgVaTEhxy-z2_WjwmrUeGRNBJpZYVOksiBZ5q_O2mPAip0ApREnU2ZrTMtEf-iFtCP3az9T_o_gWoZv_OB-Q_v61iR4hx5cPl1l-IPW3UtPPlgld_HduGW9iZuNHwTD9MSta8GV3FNdP9Pm-aDAda2bfs-YrNTzoFR37CUrBiVsHHtEkwDzKEft8XYxagY-wAir5r7y3TjY8Nfj35JI7l4tFK5X7a6",
    category: "sides",
    rating: 4.4,
    isVeg: true,
    badge: "VEG",
  },
  {
    id: "classic-coke",
    name: "Classic Coke",
    description: "Ice-cold classic cola to go with your meal.",
    price: 2.0,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCK7w5OCd9AuM7sRHKhv6eFQl8ytq8VpdsPUuxKR1YHQOij-2McLjsD5h81A5-jN01R_e8DRkmuO7-XLLgrdLIOvVveTYEX0dpJ9zf-lFFdERq-7qw5mSqR3FFUHJEWkFg8X26UzPZpAlGcx8yC06qT610ZD0hkutrz-slBtJbctrwk3QYwoGhAOyKfRI0waGGeyQbSKQx5ZvU7PkEGiEQyzRJniM89vXEAPNghMW3GpnyBN5yEYdj8hM-bg3PCP_aVPtfieeKIXeU8",
    category: "beverages",
    rating: 4.0,
    isVeg: true,
  },
  {
    id: "choco-lava-cake",
    name: "Choco Lava Cake",
    description: "Warm chocolate cake with a molten center, served with vanilla ice cream.",
    price: 5.5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6rK9NTdeaTsnqbA1fh9KIs9rOMPujK-MknFCwmd1k_n-yk8AqFsOWggxcw8Dr2M_6f96KIVv_EVsYS-ACNz6WfY47oIt-VkxnFySCUoY3b8Dm4KXAFZ_U6EJoX5rDuqkK3cY-Gw82evVMOOfH8zyaq5phGFprjG88-Zf94XMX9dKBEZuCG6Rg1_XJftwfHbzpB_wDY2vUMEiwITzMC8bigXpZWIilAlmaS1e7gTvPvygULuzouNUxFpAgf7rtzHVmzSVO2maSYCM8",
    category: "desserts",
    rating: 4.6,
    isVeg: true,
  },
  {
    id: "peri-peri-fries",
    name: "Peri Peri Fries",
    description: "Golden fries tossed in peri peri seasoning.",
    price: 4.5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDna_r9w-t8NfQ68sR8OxkSaHJcq4Qz6xnGLNg4fHSBBxfMkx1Asf_jT5Ef4cNSD_37Fp6D1uxA3G9cBFm5otemAuTv4QQUcwsqv2R1w4v6EH6Z1w7iI-dQVBcBQTViTT_39N56voD57Wqdyhgv9gN4NBXdCjmY2BuYCkwAicCcHtGn8Eln8jzWOEuvIA_UqqSQ8zrJgPkvjIYOFu2tMFC4WU3J12cAlrxKKu6B09EZcfDKg8M5tIv5zTxCVvEQugH_NUG3z8SKhCg9",
    category: "sides",
    rating: 4.3,
    isVeg: true,
    badge: "VEG",
  },
];

const initialOrders = [
  {
    customer: {
      name: "John Doe",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTQ2xwRy8RK20vPLf9wjc7mg8l4l2pe2yvfPuQiWJZlQdRyyn_TjPlBg1PFhInVfBm8neyxh9wCFSk7Di9AdKMy48Eo8f-k7DUi2vrARQ033mueA48zlwWHwhblof7ghao4aBMt9Jfyrjje2RZ-m_v26DpYlrRRvgPaOIzdjZNAycTM-ApRzd8j68e7u1SkIYyaV_pVAEkKZHocYLj16sMfCdUrWMLXSOmy5Zh1_bZZu2a2mDmug7vaHP1gZ2VHvr3gZMTchaujn4E",
    },
    items: [
      { menuItemId: "pepperoni-feast", name: "Pepperoni Feast", quantity: 2, price: 16.5 },
      { menuItemId: "classic-coke", name: "Classic Coke", quantity: 1, price: 2.0 },
    ],
    status: "Preparing",
    totalPrice: 35.0,
  },
  {
    customer: {
      name: "Jane Smith",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvmT_HMnlM0Z3-rGQ4KZJTF_K_qSlrOOZT7JfZAiJFF3SH0frLFt0z5xKHMc_vfWgr5CCiRpr3DednvPCbvl0Ii4zbvt45zx1ej_EOC1cXrHBRg2WeZHfYassP9C54ihJTPUrIlH1HZwMHyGGJnmAi_SKf7g_jw30Tn65C4d6q73o5fXg5auAvhDXvFAGfkcTfSOeQ8AK7DHFJ_1MRF3VYGWhWBp6AXqNVSHrHZZNejza-fnjqcm4Fv4t_8HxvKnPt5hsKq2P4F6p3",
    },
    items: [
      { menuItemId: "classic-cheeseburger", name: "Classic Cheeseburger", quantity: 1, price: 12.99 },
    ],
    status: "Out for Delivery",
    totalPrice: 18.0,
  },
  {
    customer: {
      name: "Mike Ross",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7G0Ub1n8spOpQk6aA2T4yQUMEvj1quC5WvBqFw0rhgVTEbMRtWGNLgGaknMfTeXF0t3vwGOrABmCGfBFB1ILREA-Q6VhLN3Ay3HEI6RXmvzpEhOW_KUbTRVB36vZYRUi1GUiRywzskiBFXR07Xx-T-p77nAp2IoSOc029NKNkGnVF0kgsNx2hHl5qi8qqX6Bzlx-o307crrSvIdymuPy0OmEDYTEJ8Ca0ujNoJOkm64BYJWC-rImGb6vNLV7deKn33aAiI6Rn4LVG",
    },
    items: [
      { menuItemId: "pepperoni-feast", name: "Pepperoni Feast", quantity: 3, price: 16.5 },
    ],
    status: "Delivered",
    totalPrice: 65.0,
  },
];

const initialAddresses = [
  {
    id: "home",
    userId: "seed_user",
    label: "Home",
    icon: "home",
    address: "Block B, Flat 402, Sunshine Apartments, Sector 14, Food Mohalla City, 110022",
    deliveryTime: "Delivery in 35-40 mins",
    isSelected: true,
  },
  {
    id: "work",
    userId: "seed_user",
    label: "Work",
    icon: "work",
    address: "Tech Park, Building 5, 3rd Floor, Sector 62, Innovation Zone",
    deliveryTime: "55-60 mins",
    isSelected: false,
  },
];

export const seed = mutation({
  handler: async (ctx) => {
    // Check if empty
    const cats = await ctx.db.query("categories").collect();
    if (cats.length > 0) return "Already seeded.";

    for (const cat of initialCategories) {
      await ctx.db.insert("categories", cat);
    }
    for (const item of initialMenuItems) {
      await ctx.db.insert("menuItems", item);
    }
    for (const order of initialOrders) {
      await ctx.db.insert("orders", order);
    }
    for (const addr of initialAddresses) {
      await ctx.db.insert("addresses", addr);
    }

    // Seed admin user
    await ctx.db.insert("users", {
      name: "Admin",
      username: "admin",
      password: "admin123", // In production, use hashed passwords!
      phone: "+91 00000 00000",
      role: "admin",
      avatar: "https://ui-avatars.com/api/?name=Admin&background=ec7f13&color=fff",
    });

    // Seed default admin settings
    await ctx.db.insert("adminSettings", {
      key: "notificationSound",
      value: "ting",
    });

    return "Seeded successfully!";
  },
});

/**
 * Ensure admin user exists — can be run independently.
 */
export const seedAdmin = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", "admin"))
      .first();

    if (existing) return "Admin user already exists.";

    await ctx.db.insert("users", {
      name: "Admin",
      username: "admin",
      password: "admin123",
      phone: "+91 00000 00000",
      role: "admin",
      avatar: "https://ui-avatars.com/api/?name=Admin&background=ec7f13&color=fff",
    });

    return "Admin user created!";
  },
});
