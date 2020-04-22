import uuid from 'uuid/v4';

const amount =   parseFloat(document.getElementById("total").innerHTML);
console.warn('a', amount);
const $messageBox = document.getElementById('messageBox');
const $button = document.querySelector('button');

function resetButtonText() {
  $button.innerHTML = 'Click to Buy! <strong>$10</strong>';
}

var stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

var checkoutButton = document.querySelector('#checkout-button');
checkoutButton.addEventListener('click', function () {
  stripe.redirectToCheckout({
    items: [{
      // Define the product and SKU in the Dashboard first, and use the SKU
      // ID in your client-side code.
      sku: 'sku_123',
      quantity: 1
    }],
    successUrl: 'https://www.example.com/success',
    cancelUrl: 'https://www.example.com/cancel'
  });
});

const handler = StripeCheckout.configure({
  key: STRIPE_PUBLISHABLE_KEY,
  image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
  locale: 'auto',
  closed: function () {
    resetButtonText();
  },
  token: async function(token) {

    let response, data;

    try {
      response = await fetch(LAMBDA_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
          token,
          amount,
          idempotency_key: uuid()
        }),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      });

      data = await response.json();
    } catch (error) {
      console.error(error.message);
      return;
    }

    resetButtonText();

    let message = typeof data === 'object' && data.status === 'succeeded'
      ? 'Charge was successful!'
      : 'Charge failed.'
    $messageBox.querySelector('h2').innerHTML = message;

    console.log(data);
  }
});

$button.addEventListener('click', () => {

  setTimeout(() => {
    $button.innerHTML = 'Waiting for response...';
  }, 500);

  handler.open({
    amount,
    name: 'Eau Natural',
    description: 'Lip Balm'
  });
});
