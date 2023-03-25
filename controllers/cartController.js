module.exports = function Cart(oldCart) {
    // Khởi tạo giỏ hàng
    this.items = oldCart.items || {};
    this.totalQuantity = oldCart.totalQuantity || 0;
    this.totalPrice = oldCart.totalPrice || 0;
    this.address = oldCart.address || {};
    this.paymentMethod = oldCart.paymentMethod || 'COD';

    this.getTotalQuantity = () => {
        let quantity = 0;
        const items = Object.values(this.items);
        for (let i = 0; i < items.length; i += 1) {
            quantity += parseInt(items[i].quantity, 10);
        }
        return quantity;
    };

    this.getTotalPrice = () => {
        let price = 0;
        const items = Object.values(this.items);
        for (let i = 0; i < items.length; i += 1) {
            price += parseFloat(items[i].price);
        }
        price = parseFloat(price).toFixed(2);

        return price;
    };

    this.add = (item, id, quantity) => {
        let storedItem = this.items[id];
        if (!storedItem) {
            this.items[id] = { item, quantity: 0, price: 0 };
            storedItem = this.items[id];
        }

        storedItem.item.price = parseFloat(storedItem.item.price);
        storedItem.quantity += parseInt(quantity, 10);
        storedItem.price = parseFloat(storedItem.item.price * storedItem.quantity);

        this.totalQuantity = this.getTotalQuantity();
        console.log(this.totalQuantity);
        this.totalPrice = this.getTotalPrice(); //????????
        return this.getCartItem(id);
    };

    this.remove = (id) => {
        const storedItem = this.items[id];
        if (storedItem) {
            delete this.items[id];
            this.totalQuantity = this.getTotalQuantity();
            this.totalPrice = this.getTotalPrice();
        }
    };

    this.update = (id, quantity) => {
        const storedItem = this.items[id];
        if (storedItem && quantity >= 1) {
            storedItem.quantity = quantity;
            storedItem.price = parseFloat(storedItem.item.price * storedItem.quantity);
            this.totalQuantity = this.getTotalQuantity();
            this.totalPrice = this.getTotalPrice();
        }
        return this.getCartItem(id);
    };

    this.empty = () => {
        this.items = {};
        this.totalQuantity = 0;
        this.totalPrice = 0;
    };

    this.generateArray = () => {
        const arr = [];
        const items = Object.values(this.items);
        for (let i = 0; i < items.length; i += 1) {
            items[i].item.price = parseFloat(items[i].item.price).toFixed(2);
            items[i].price = parseFloat(items[i].price).toFixed(2);
            arr.push(items[i]);
        }
        return arr;
    };

    this.getCart = () => {
        const cart = {
            items: this.generateArray(),
            totalQuantity: this.totalQuantity,
            totalPrice: this.totalPrice,
            address: this.address,
            paymentMethod: this.paymentMethod,
        };
        return cart;
    };

    this.getCartItem = (id) => {
        const cartItem = {
            item: this.items[id],
            totalQuantity: this.totalQuantity,
            totalPrice: this.totalPrice,
        };
        return cartItem;
    };
};
