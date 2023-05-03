const nodemailer = require("nodemailer");
const config = {
  service: "gmail",
  auth: {
    user: "shafiarahman572@gmail.com",
    pass: "eikbymbhwcrknxjx",
  },
};
function sendBookingEmail(booking) {
  const { email, bookingDate, selectedTime, category } = booking;
  console.log(booking);
  const transporter = nodemailer.createTransport(config);

  transporter.sendMail(
    {
      from: "shafiarahman572@gmail.com", // verified sender email
      to: email, // recipient email
      subject: `Your booking is confirmed`, // Subject line
      text: "Hello world!", // plain text body
      html: `
        <h3>Your ${category} is confirmed</h3>
        <div>
            <p>Please visit us on ${bookingDate} at ${selectedTime}</p>
            <p>Thanks from Bistro Boss.</p>
        </div>
        
        `, // html body
    },
    function (error, info) {
      if (error) {
        console.log("Email send error", error);
      } else {
        console.log("Email sent: " + info);
      }
    }
  );
}

function sendPaymentEmail(payment) {
  // const { email, bookingDate, selectedTime, category } = booking;
  // console.log(booking);
  console.log(payment);
  const transporter = nodemailer.createTransport(config);

  transporter.sendMail(
    {
      from: "shafiarahman572@gmail.com", // verified sender email
      to: payment.email, // recipient email
      subject: `Your payment is successful`, // Subject line
      text: "Hello world!", // plain text body
      html: `<html>
       	<head>
		
		

		<style>
			.invoice-box {
				max-width: 800px;
				margin: auto;
				padding: 30px;
				border: 1px solid #eee;
				box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
				font-size: 16px;
				line-height: 24px;
				font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
				color: #555;
			}

			.invoice-box table {
				width: 100%;
				line-height: inherit;
				text-align: left;
			}

			.invoice-box table td {
				padding: 5px;
				vertical-align: top;
			}

			.invoice-box table tr td:nth-child(2) {
				text-align: right;
			}

			.invoice-box table tr.top table td {
				padding-bottom: 20px;
			}

			.invoice-box table tr.top table td.title {
				font-size: 45px;
				line-height: 45px;
				color: #333;
			}

			.invoice-box table tr.information table td {
				padding-bottom: 40px;
			}

			.invoice-box table tr.heading td {
				background: #eee;
				border-bottom: 1px solid #ddd;
				font-weight: bold;
			}

			.invoice-box table tr.details td {
				padding-bottom: 20px;
			}

			.invoice-box table tr.item td {
				border-bottom: 1px solid #eee;
			}

			.invoice-box table tr.item.last td {
				border-bottom: none;
			}

			.invoice-box table tr.total td:nth-child(2) {
				border-top: 2px solid #eee;
				font-weight: bold;
			}

			@media only screen and (max-width: 600px) {
				.invoice-box table tr.top table td {
					width: 100%;
					display: block;
					text-align: center;
				}

				.invoice-box table tr.information table td {
					width: 100%;
					display: block;
					text-align: center;
				}
			}

			/** RTL **/
			.invoice-box.rtl {
				direction: rtl;
				font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
			}

			.invoice-box.rtl table {
				text-align: right;
			}

			.invoice-box.rtl table tr td:nth-child(2) {
				text-align: left;
			}
		</style>
	</head>

	<body>
		<div class="invoice-box">
			<table cellpadding="0" cellspacing="0">
				<tr class="top">
					<td colspan="2">
						<table>
							<tr>
								<td class="title">
									<img src="https://i.ibb.co/StTsCDg/logo.png" style="width: 100%; max-width: 300px" />
								</td>

								<td>
									Invoice #:${new Date().getFullYear()}.${
        Math.floor(Math.random() * 9000) + 1000
      }<br />
									Created: ${payment.date}<br />
									
								</td>
							</tr>
						</table>
					</td>
				</tr>

				<tr class="information">
					<td colspan="2">
						<table>
							<tr>
								<td>
									Bistro Boss<br />
									ABC Main Street<br />
								  Uni 21, Bangladesh
								</td>

								<td>
									Client Info.<br />
									${payment.name}<br />
									${payment.email}
								</td>
							</tr>
						</table>
					</td>
				</tr>

				<tr class="heading">
					<td>Payment Method</td>

					<td>Transaction ID#</td>
				</tr>

				<tr class="details">
					<td>Card</td>

					<td>${payment.transactionId}</td>
				</tr>

				<tr class="heading">
					<td>Item</td>

					<td>Price</td>
				</tr>

				<tr class="item">
					<td>${payment.category}</td>

					<td>$${payment.order.amount}</td>
				</tr>

				<tr class="item">
					<td>Coupon</td>

					<td>${payment.order.coupon}%</td>
				</tr>

				

				<tr class="total">
					<td></td>

					<td>Total: $${payment.total}</td>
				</tr>
			</table>
		</div>
	</body>
</html>
        `, // html body
    },
    function (error, info) {
      if (error) {
        console.log("Email send error", error);
      } else {
        console.log("Email sent: " + info);
      }
    }
  );
}

module.exports = {
  sendBookingEmail,
  sendPaymentEmail,
};
