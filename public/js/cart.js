function addToCart() {
    console.log('test addToCart');
    const productId = $(this).attr('data-id'); // hoặc data('id');
    const quantity = $('#sst').val() || 1;
    $.ajax({
        url: '/cart',
        type: 'POST',
        data: { productId, quantity },
        success: (result) => {
            $('#cart-badge').html(result.totalQuantity);
            $('#sst').val(1);
        },
    });
}

$(document).ready(() => {
    $('.add-to-cart').on('click', addToCart);
});

function removeCartItem(productId) {
    $.ajax({
        url: '/cart',
        type: 'DELETE',
        data: { productId },
        success: (result) => {
            $('#cart-badge').html(result.totalQuantility);
            $('#total-price').html(`$${result.totalPrice}`);
            if (result.totalQuantility === 0) {
                console.log(result.totalQuantility);
                $('#cart-body').html("<div class='p-5 m-5 alert alert-info text-center'>The cart is empty!</div>");
            } else {
                $(`#cart-item-row-${productId}`).remove();
            }
        },
    });
}

function updateCart(productId, quantity) {
    if (quantity == 0) {
        removeCartItem(productId);
    } else {
        $.ajax({
            url: '/cart',
            type: 'PUT',
            data: { productId, quantity },
            success: (result) => {
                $('#cart-badge').html(result.totalQuantity);
                $('#total-price').html(`$${result.totalPrice}`);
                $(`#total-price-${productId}`).html(result.item.price);
            },
        });
    }
}

function clearCart() {
    if (confirm('Do you realy want to remove all items?')) {
        $.ajax({
            url: '/cart/all',
            type: 'DELETE',
            success: (result) => {
                $('#cart-body').html("<div class='p-5 m-5 alert alert-info text-center'>The cart is empty!</div>");
                $('#cart-badge').html(' ');
            },
        });
    }
}
