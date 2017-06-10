THE FUNCTIONS USED IN THE SERVER (INCLUDING INPUT AND OUTPUT)
Register - Registragion to the system.
Input: JSON - { "username": "", "password": "", "fname": "", "lname":"", "address": "", "city": "", "counter": "", "phone": "", "cell": "", "mail" : "", "creditCardNum": "", "ans1": "", "ans2": "", "category1": "", "category2":"" }
Output: boolean

Login - Login to the system.
Input: JSON - {"username": "", "password": "" }
Output: boolean

RestorePassword - Restoration of the password.
Input: JSON {"username":"", "ans1":"", "ans2":"" }
Output: boolean

Top5 - Returns a list of JSONs of top 5 products for the week.
Input: -
Output: list of JSONs

LastMonthItems - Returns a list of products that were added last month
Input: -
Output: list of JSONs

Categories - Returns a list of all categories
Input: - 
Output: List of JSONs

ProductsByCategory - Returns a list of all product from a given category
Input: JSON - {"category": "" }
Output: list of JSONs

AllProducts - Returns a list of all products
Input: - 
Output: list of JSONs

SuggestedProducts - Returns a suggested product to a specific user according to his country and the product's country
Input: JSON - { "username": "" }
Output: 

ProductSearch - Returns all products that contains a given string (=product name)
Input: JSON - { "productname" : "" }
Output: list of JSONs (the products)

ProductDetails - Returns the product details of an asked product
Input: JSON - { "productname": "" }
Output: list of JSONs

AddToCart - Adds a product to a specific user's cart by the name and amount asekd.
Input: JSON - {"productname" : "", "username": "", "amount":""}Output: boolean 

DisplayCartItems - Returns a list of all cart items of a specific user
Input: JSON {"username" : "" }
Output: List of JSONs

RemoveFromCart - Removes a product from the cart of the user
Input: JSON {"productname":"", "username": ""}
Output: boolean

PastOrders - To get a list of all the user's past orders.
Input: JSON {"username" : "" }
Output:  List of JSONs of past orders

CartPurchase - To order the items within the cart and to transfer the records to the Orders table
Input: JSON {"username" : "", "Shippmentdata" : "" }
Output: bool

CartTotalSum - To calculate a user cart total sum
Input: JSON {"username"}
Output: float (the sum)

ProductsByFeatures - To find all the matching products by flavor company
Input: JSON {"username" : "", "flavor" : "", "company" : "" }
Output: List of JSONs of products

Also, the port we used is 3100.

