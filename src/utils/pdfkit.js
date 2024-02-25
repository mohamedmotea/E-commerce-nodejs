import fs from 'fs'
import PDFDocument from 'pdfkit'
import path from 'path'

function createInvoice(invoice, pathVar) {
  let doc = new PDFDocument({ size: 'A4', margin: 50 })

  generateHeader(doc)
  generateCustomerInformation(doc, invoice)
  generateInvoiceTable(doc, invoice)
  generateFooter(doc)

  doc.end()
  doc.pipe(fs.createWriteStream(path.resolve(`./Files/${pathVar}`)))
}

function generateHeader(doc) {
  doc
    .image('project-logo.png', 50, 45, { width: 50 })
    .fillColor('#444444') // black
    .fontSize(20) // 20
    .text('Mote3', 110, 57) // Route
    .fillColor('#09c')
    .fontSize(10)
    .text('E-commerce_Mote3', 200, 50, { align: 'right' })
    .text('6 tahrir street', 200, 65, { align: 'right' })
    .text('Cairo,Egypt', 200, 80, { align: 'right' })
    .moveDown()
}

function generateCustomerInformation(doc, invoice) {
  doc.fillColor('#444444').fontSize(20).text('Invoice', 50, 160)

  generateHr(doc, 185)

  const customerInformationTop = 200

  doc
    .fontSize(10)
    .text('Order Code:', 50, customerInformationTop)
    .font('Helvetica-Bold')
    .text(invoice.orderCode, 150, customerInformationTop)
    .font('Helvetica')
    .text('Invoice Date:', 50, customerInformationTop + 30)
    .text(formatDate(new Date(invoice.date)), 150, customerInformationTop + 30)
    .font('Helvetica-Bold')
    .text(invoice.shipping.name, 300, customerInformationTop,    { align: 'right' })
    .font('Helvetica')
    .text(invoice.shipping.address, 300, customerInformationTop + 15,    { align: 'right' })
    .text(
      invoice.shipping.city +
        ', ' + 
        invoice.shipping.state +
        ', ' +
        invoice.shipping.country,
      300,
      customerInformationTop + 30,
      { align: 'right' }
    )
    
    .moveDown()

  generateHr(doc, 252)
}

function generateInvoiceTable(doc, invoice) {
  let i
  const invoiceTableTop = 330

  doc.font('Helvetica-Bold')
  generateTableRow(
    doc,
    invoiceTableTop,
    'Item',
    'Unit Cost',
    'Discount',
    'final Price',
    'Quantity',
    'total Price',
  )
  generateHr(doc, invoiceTableTop + 20)
  doc.font('Helvetica')

  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i]
    const position = invoiceTableTop + (i + 1) * 30
    generateTableRow(
      doc,
      position,
      item.title, // product title
      formatCurrency(item.basePrice), // product price
      item.discount, 
      formatCurrency(item.finalPrice), // product final price After Discount
      item.quantity, // product quantity
      formatCurrency(item.totalPrice), // product final price After Discount
  
    )

    generateHr(doc, position + 20)
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30 + 60
  generateHr2(doc,subtotalPosition - 10)
  generateTableRow(
    doc,
    subtotalPosition,
    '',
    '',
    'Subtotal',
    formatCurrency(invoice.subTotal),
    '',
    '',// orderSubTotal
  )


  const paidToDatePosition = subtotalPosition + 20
  generateTableRow(
    doc,
    paidToDatePosition,
    '',
    '',
    'Paid Amount',
    formatCurrency(invoice.paidAmount), 
    '',
    '',
    // orderPaidAmount
  )
  generateHr2(doc,paidToDatePosition + 15)

  doc.font('Helvetica')
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      'Payment is due within 15 days. Thank you for your business.',
      50,
      780,
      { align: 'center', width: 500 },
    )
}

function generateTableRow(
  doc,
  y,
  item,
  unitCost,
  discount,
  finalPrice,
  quantity,
  totalPrice,
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(unitCost, 170, y)
    .text(discount, 230, y, { width: 90, align: 'center' })
    .text(finalPrice, 320, y, { width: 90, align: 'center' })
    .text(quantity, 400, y, {  width: 90,  align: 'center' })
    .text(totalPrice, 0, y, { align: 'right' })
}

function generateHr(doc, y) {
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke()
}

function formatCurrency(cents) {
  return cents + 'EGP'
}

function formatDate(date) {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  return year + '/' + month + '/' + day
}
function generateHr2(doc, y) {
  doc.strokeColor('#eeeeee').lineWidth(1).moveTo(240, y).lineTo(390, y).stroke()
}

export default createInvoice
