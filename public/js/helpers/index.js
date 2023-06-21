
const createDiv = (attr) => $("<div></div>").attr(attr)
const createClickablePopover = (attr, popupContent, onClick) => $(`<a tabindex="0" data-toggle="popover" data-trigger="focus" title="${popupContent}"></a>`).attr(attr)
    .on('click', onClick)
    .addClass('clickable')
    .popover({
        trigger: 'focus',
    })
const createClickableH4 = (attr, onClick) => createH4(attr)
    .on('click', onClick)
    .addClass('clickable')
const createH4 = (attr) => $("<h4></h4>").attr(attr)
