
const modalSearchBtn = $('.search_btn')
const modalOpenBtn = $('.modal-open__order-status')
const serialNumberInput = $('.serialNumberInput')
const quittanceInput = $('.quittanceInput')
const unpInput = $('.unpInput')
const modal = $('.modal')
const errorMsg = $('#errorMsg')
const dataTable = $('.tg')
const btnPriceList = $('.btn_price-list')
const excel = 'SGStemporary.xlsx'
let excelData = null;

const url = `/${excel}`;

function loadData() {
    $.ajax({
        cache: false,
        type: "GET",
        url: url,
        xhrFields: {
            responseType: 'arraybuffer'
        },
        success: function (data) {
            const workbook = XLSX.read(data, { type: "array", cellDates: true, cellNF: true, cellText: false });
            const sheetDataList = workbook.SheetNames;
            const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheetDataList[0]]).filter(function (order) {
                currentDate = new Date(order.Date)
                periodStart = moment().endOf('month')
                endPeriodMonth = moment(periodStart).subtract('2', 'months')
                periodEnd = moment(endPeriodMonth).startOf('month')
                periodStart.toDate().toLocaleDateString()
                periodEnd.toDate().toLocaleDateString()
                currentDate.toLocaleDateString()

                return currentDate < periodStart && currentDate > periodEnd

            })

            excelData = dataExcel
        },
        error: function (xhr) {
            console.log(xhr.status)
        }
    })
}

modalSearchBtn.on('click', checkOrderStatus)
modalOpenBtn.on('click', loadData)
btnPriceList.on('click', downloadPriceList)
modal.on('hide.bs.modal', clearModal)

$('input.search-input').keypress(function (e) {
    if (e.which == 13) {
        modalSearchBtn.click()
        return false;
    }
});

function checkOrderStatus(e) {

    e.preventDefault()

    const orderResult = excelData.filter(function (order) {
        return order.SerialNumber === serialNumberInput.val() && order.UNP === Number(unpInput.val()) || order.QuittanceNumber === Number(quittanceInput.val()) && order.UNP === Number(unpInput.val()) || order.UNP === undefined && Number(quittanceInput.val()) === order.QuittanceNumber
    })

    $('tr.rowData').html('')

    if (orderResult.length > 0) {
        orderResult.map((row) => {
            convertedDate = moment(row.Date).add('1', 'days').toDate().toLocaleDateString()

            dataTable.append('<tr class="rowData">' + '<td>' + (row.QuittanceNumber ? row.QuittanceNumber : "-") + '</td>' + '<td>' + (row.UNP ? row.UNP : "-") + '</td>' + '<td>' + convertedDate + '</td>' + '<td>' + (row.DeviceName ? row.DeviceName : "-") + '</td>' + '<td>' + (row.DeviceType ? row.DeviceType : "-") + '</td>' + '<td>' + (row.SerialNumber ? row.SerialNumber : "-") + '</td>' + '<td>' + (row.WorkStatus ? row.WorkStatus : "-") + '</td>' + '<td>' + (row.RepairSummary ? row.RepairSummary : "-") + '</td>' + '<td>' + (row.Docs ? row.Docs : "-") + '</td>' + '</tr>')
        })

        errorMsg.hide()
        dataTable.show()

    } else {
        dataTable.hide()
        errorMsg.show();
        errorMsg.html('Ваш заказ в работе')
    }

}

function downloadPriceList() {
    priceURL = '/Price.pdf'
    $(location).attr('href', priceURL).attr('target', '_blank')
}

function clearModal() {
    serialNumberInput.val('')
    quittanceInput.val('')
    unpInput.val('')
    dataTable.hide()
    errorMsg.hide()
}

