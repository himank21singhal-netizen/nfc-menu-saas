import os
from supabase import create_client, Client

# Get these two values from Supabase Dashboard -> Project Settings -> API
SUPABASE_URL = "https://wrihatocimaoklrtwzeq.supabase.co"
SUPABASE_KEY = "sb_publishable_n98oFXjYtmwTKUpzMK46IQ_CYyh5Cr-"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_restaurant_menu(slug: str):
    # Fetch restaurant details
    rest_response = supabase.table("restaurants").select("*").eq("slug", slug).execute()
    
    if not rest_response.data:
        print(f"Restaurant '{slug}' not found!")
        return

    restaurant = rest_response.data[0]
    print(f"=== {restaurant['name']} ({restaurant['currency']}) ===")

    # Fetch categories & items scoped strictly to this tenant
    items_response = supabase.table("menu_items").select("*, categories(name)").eq("restaurant_id", restaurant["id"]).execute()

    for item in items_response.data:
        status = "🟢 In Stock" if item["is_available"] else "🔴 Sold Out"
        veg_tag = "🌱 Veg" if item["is_veg"] else "🍗 Non-Veg"
        category_name = item["categories"]["name"] if item.get("categories") else "Uncategorized"
        
        print(f"[{category_name}] {item['name']} - ₹{item['price']} ({veg_tag}) | {status}")

if __name__ == "__main__":
    fetch_restaurant_menu("urban-bistro")