//Import the library into your project
var easyinvoice = require('easyinvoice');
const fs = require('fs')
const path = require('path')
const util = require('util')
const writeFileAsync = util.promisify(fs.writeFile)

function Invoice(order) {
    console.log(order);
    console.log('ok its calleD');
    var data = {
        // Customize enables you to provide your own templates
        // Please review the documentation for instructions and examples
        "customize": {
            //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
        },
        "images": {
            // The logo on top of your invoice
            "logo": "https://public.easyinvoice.cloud/img/logo_en_original.png",
            // The invoice background
            "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
        },
        // Your own data
        "sender": {
            "company": "BIZPRO",
            "address": "VATAKARA",
            "zip": "673104",
            "city": "VATAKARA",
            "country": "KERALA"
            //"custom1": "custom value 1",
            //"custom2": "custom value 2",
            //"custom3": "custom value 3"
        },
        // Your recipient
        "client": {
            "company": order.userId.name,
            "address": order.Address.Name,
            "zip": order.Address.AddressLane,
            "city": order.Address.City,
            "country": order.Address.State,
            // "custom1": "custom value 1",
            // "custom2": "custom value 2",
            // "custom3": "custom value 3"
        },
        "information": {
            // Invoice number
            "number": order._id,
            // Invoice data
            "date": order.OrderDate,
            // Invoice due date
            "due-date": order.OrderDate
        },
        // The products you would like to see on your invoice
        // Total values are being calculated automatically
        "products": order.products.map((product) =>(

            {
                "quantity": product.Quantity,
                "description": product.productId.ProductName,
                "tax-rate": 0,
                "price": product.productId.Price
            }
      
        )),
        // The message you would like to display on the bottom of your invoice
        "bottom-notice": "Thanks for your purchase ",
        // Settings to customize your invoice
        "settings": {
            "currency": "USD",
            "tax-notation": "vat",
            "currency": "INR",
            "tax-notation": "GST",
            "margin-top": 50,
            "margin-right": 50,
            "margin-left": 50,
            "margin-bottom": 25
            // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
            // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')        
            // "margin-top": 25, // Defaults to '25'
            // "margin-right": 25, // Defaults to '25'
            // "margin-left": 25, // Defaults to '25'
            // "margin-bottom": 25, // Defaults to '25'
            // "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
            // "height": "1000px", // allowed units: mm, cm, in, px
            // "width": "500px", // allowed units: mm, cm, in, px
            // "orientation": "landscape", // portrait or landscape, defaults to portrait
        },
        // Translate your invoice to your preferred language
        "translate": {
            // "invoice": "FACTUUR",  // Default to 'INVOICE'
            // "number": "Nummer", // Defaults to 'Number'
            // "date": "Datum", // Default to 'Date'
            // "due-date": "Verloopdatum", // Defaults to 'Due Date'
            // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
            // "products": "Producten", // Defaults to 'Products'
            // "quantity": "Aantal", // Default to 'Quantity'
            // "price": "Prijs", // Defaults to 'Price'
            // "product-total": "Totaal", // Defaults to 'Total'
            // "total": "Totaal", // Defaults to 'Total'
            // "vat": "btw" // Defaults to 'vat'
        },
    };
    //Create your invoice! Easy!
    return new Promise(async(resolve,reject) =>{
        try{
            const result = await easyinvoice.createInvoice(data)
            const filePath = path.join(__dirname,'pdf',`${order._id}.pdf`)
            console.log(filePath);
            await writeFileAsync(filePath,result.pdf,'base64');
            resolve(filePath)
        }catch(error){
            console.log(error);
            reject(error)
        }
    })
    
}

module.exports = Invoice;
