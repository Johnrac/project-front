$(document).ready(() => {
    showList();
});

function showList() {
    $("tbody").empty();

    let countPlayers = getTotalCountPlayers();
    let counter = $("#counter").val();
    let countPerPage = Math.ceil(countPlayers / counter);
    showCountPages(countPerPage);
    let currentPage = parseInt($("#paging .active").text());

    $.get("/rest/players", {
        "pageNumber": "" + (currentPage - 1),
        "pageSize": "" + counter
    }, (data) => getPlayers(data));
}

function showCountPages(countPerPage) {
    const container_paging = $("#paging");
    let activePage = getNumberActivePage(countPerPage);

    container_paging.empty();
    container_paging.text("Pages:")
    for (let i = 0; i < countPerPage; i++) {
        addButtonPage(activePage, i, container_paging);
    }
}

function addButtonPage(activePage, indexButton, container) {
    let newButton = $("<button class=\"clickable\"></button>");
    newButton.text(indexButton + 1);
    addActionButtonPage(newButton);

    if (indexButton === activePage) {
        newButton.addClass("active");
    } else {
        newButton.addClass("inactive");
    }
    newButton.appendTo(container);
}

function addActionButtonPage(buttonPage) {
    buttonPage.on('click', function () {
        $("#paging button")
            .removeClass("active")
            .addClass("inactive");
        $(this).removeClass("inactive").addClass("active");
        showList();
    });
}

function getNumberActivePage(countPerPage) {
    let activePage = parseInt($("#paging .active").text());
    if (isNaN(activePage) || activePage > countPerPage) {
        activePage = 0;
    } else {
        activePage = activePage - 1;
    }
    return activePage;
}

function getTotalCountPlayers() {
    let count = 0;
    $.ajax({
        method: "GET",
        async: false,
        url: "/rest/players/count",
        success: function (result) {
            count = parseInt(result);
        }
    });
    return count;
}

function getPlayers(data) {
    const tbody = $("#players tbody");

    data.forEach((player) => {
        let row = $("<tr></tr>");
        addCells(player, row);
        addButtonEdit(player, row);
        addButtonDelete(player, row);

        tbody.append(row);
    });
}

function addButtonDelete(player, row) {
    let imgDelete = $("<img src=\"/img/delete.png\" class=\"clickable\" alt=\"delete\">")
        .click(() => deletePlayer(player.id));
    $("<td></td>").append(imgDelete).appendTo(row);
}

function addButtonEdit(player, row) {
    let imgEdit = $("<img src=\"/img/edit.png\" class=\"clickable\" alt=\"edit\">");

    addActionEdit(imgEdit, row, player);

    $("<td></td>").append(imgEdit).appendTo(row);
}

function addActionEdit(img, row, player) {
    img.click(function () {
        hideButtonDelete(row);

        let parentTd = $(this).parent();
        parentTd.empty();
        createSaveButton(parentTd, player, row);

        showEditFields(player, row);
    });
}

function hideButtonDelete(row) {
    let deleteImg = row.find("img[alt=\"delete\"]");
    deleteImg.addClass("hidden");
}

function addCells(player, row) {
    $("<td class='id'></td>").text(player.id).appendTo(row);
    $("<td class='name'></td>").text(player.name).appendTo(row);
    $("<td class='title'></td>").text(player.title).appendTo(row);
    $("<td class='race'></td>").text(player.race).appendTo(row);
    $("<td class='profession'></td>").text(player.profession).appendTo(row);
    $("<td class='level'></td>").text(player.level).appendTo(row);
    $("<td class='birthday'></td>").text(new Date(player.birthday).toLocaleDateString("en-US")).appendTo(row);
    $("<td class='banned'></td>").text(player.banned).appendTo(row);
}

function createSaveButton(td, player, row) {
    let imgSave = $("<img src=\"/img/save.png\" class=\"clickable\" alt=\"save\">");

    addActionSaveOnRow(imgSave, row, player);

    td.append(imgSave);
}

function addActionSaveOnRow(imgSave, row, player) {
    imgSave.on('click', () => {
        const updatedPlayer = getUpdatedPlayer(row, player.id);
        sendUpdateQuery(player.id, updatedPlayer);
    });
}

function sendUpdateQuery(idOldPlayer, updatedPlayer) {
    $.ajax({
        url: "/rest/players/" + idOldPlayer,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(updatedPlayer),
        success: () => {
            showList();
        }
    });
}

function getUpdatedPlayer(row, idOldPlayer) {
    const name = row.find('td.name input').val();
    const title = row.find('td.title input').val();
    const race = row.find('td.race select').val();
    const profession = row.find('td.profession select').val();
    const banned = row.find('td.banned select').val();

    return {
        id: idOldPlayer,
        name: name,
        title: title,
        race: race,
        profession: profession,
        banned: banned,
    };
}

function showEditFields(player, row) {

    const editFields = getEditFields(row);

    addHtml(editFields, player);
}

function addHtml(editFields, player) {
    editFields.nameTd.html(`<input type='text' value='${player.name}'>`);
    editFields.titleTd.html(`<input type='text' value='${player.title}'>`);
    editFields.raceTd.html(`
        <select>
            <option value="HUMAN" ${player.race === 'HUMAN' ? 'selected' : ''}>HUMAN</option>
            <option value="ORC" ${player.race === 'ORC' ? 'selected' : ''}>ORC</option>
            <option value="DWARF" ${player.race === 'DWARF' ? 'selected' : ''}>DWARF</option>
            <option value="ELF" ${player.race === 'ELF' ? 'selected' : ''}>ELF</option>
            <option value="GIANT" ${player.race === 'GIANT' ? 'selected' : ''}>GIANT</option>
            <option value="TROLL" ${player.race === 'TROLL' ? 'selected' : ''}>TROLL</option>
            <option value="HOBBIT" ${player.race === 'HOBBIT' ? 'selected' : ''}>HOBBIT</option>
        </select>`);
    editFields.professionTd.html(`
        <select>
            <option value="WARRIOR" ${player.profession === 'WARRIOR' ? 'selected' : ''}>WARRIOR</option>
            <option value="ROGUE" ${player.profession === 'ROGUE' ? 'selected' : ''}>ROGUE</option>
            <option value="SORCERER" ${player.profession === 'SORCERER' ? 'selected' : ''}>SORCERER</option>
            <option value="CLERIC" ${player.profession === 'CLERIC' ? 'selected' : ''}>CLERIC</option>
            <option value="PALADIN" ${player.profession === 'PALADIN' ? 'selected' : ''}>PALADIN</option>
            <option value="NAZGUL" ${player.profession === 'NAZGUL' ? 'selected' : ''}>NAZGUL</option>
            <option value="WARLOCK" ${player.profession === 'WARLOCK' ? 'selected' : ''}>WARLOCK</option>
        </select>`);
    editFields.bannedTd.html(`
      <select>
        <option value="true" ${player.banned === true ? 'selected' : ''}>true</option>
        <option value="false" ${player.banned === false ? 'selected' : ''}>false</option>
     </select>`);
}

function getEditFields(row) {
    return {
        nameTd: row.find('td.name'),
        titleTd: row.find('td.title'),
        raceTd: row.find('td.race'),
        professionTd: row.find('td.profession'),
        bannedTd: row.find('td.banned'),
    }
}

function getNewPlayer() {
    const name = $("#name").val();
    const title = $("#title").val();
    const race = $("#race").val();
    const profession = $("#profession").val();
    const level = $("#level").val();
    const birthday = $("#birthday").val();
    const banned = $("#banned").val();

    return {
        name: name,
        title: title,
        race: race,
        profession: profession,
        birthday: birthday,
        banned: banned,
        level: level
    };
}

function createPlayer() {

    const createdPlayer = getNewPlayer();

    if (isGoodPlayer(createdPlayer)) {
        createdPlayer.birthday = Date.parse(createdPlayer.birthday)
        sendCreateQuery(createdPlayer);
    }
}

function sendCreateQuery(createdPlayer) {
    $.ajax({
        url: "/rest/players",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(createdPlayer),
        async: false,
        success: () => {
            clearAllFields();
            showList();
            setTimeout(function () {
                $("#paging button").last().click();
            }, 30);
        },
        error: (error) => {
            alert("Server responded with a status of " + error.status)
        }
    });
}

function clearAllFields() {
    $("#name").val('');
    $("#title").val('');
    $("#race").val('HUMAN');
    $("#profession").val('WARRIOR');
    $("#level").val('');
    $("#birthday").val('');
    $("#banned").val('false');
}

function isGoodPlayer(player) {

    if (isEmpty(player.name) || isEmpty(player.title)
        || isEmpty(player.level) || isEmpty(player.birthday)) {
        alert("Fields name, title, level and birthday not should be empty");
        return false;
    }

    if (player.name.length > 12 || player.title.length > 30) {
        alert("Fields name should be less 12 and title less 30")
        return false;
    }

    if (player.level < 0 || player.level > 100) {
        alert("Field level should be from 0 to 100")
        return false;
    }
    let birthday = new Date(player.birthday);
    let year = birthday.getFullYear();
    if (year < 2000 || year > 3000) {
        alert("Birthday should be from 2000 to 3000 year")
        return false;
    }
    return true;
}

function isEmpty(str) {
    str = "" + str;
    return !str || str.trim() === "";
}

function deletePlayer(id) {
    $.ajax({
        method: "DELETE",
        url: "/rest/players/" + id,
        success: function () {
            showList();
        }
    });
}