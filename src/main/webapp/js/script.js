$(document).ready(() => {
    showList();
});

function showList() {
    $("tbody").empty();

    let countPlayers = getTotalCountPlayers();
    let counter = $("#counter").val();
    let countPerPage = Math.ceil(countPlayers / counter);
    showCountPages(countPerPage);
    let currentPage = parseInt($("#paging .active")[0].innerText);

    $.get("/rest/players", {
        "pageNumber": "" + currentPage - 1,
        "pageSize": "" + counter
    }, (data) => getPlayers(data));
}

function showCountPages(countPerPage) {
    const paging = $("#paging");
    let activePage = $("#paging .active").text();
    if (activePage === "" || activePage > countPerPage) {
        activePage = 0;
    } else {
        activePage = parseInt(activePage) - 1;
    }
    paging.empty();
    paging.text("Pages:")
    for (let i = 0; i < countPerPage; i++) {
        let newButton = $("<button class=\"clickable\"></button>");
        newButton.text(i + 1);
        newButton.on('click', function () {
            $("#paging button")
                .removeClass("active")
                .addClass("inactive");
            $(this).removeClass("inactive").addClass("active");
            showList();
        });
        if (i === activePage) {
            newButton.addClass("active");
        } else {
            newButton.addClass("inactive");
        }
        newButton.appendTo(paging);
    }
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
        $("<td class='id'></td>").text(player.id).appendTo(row);
        $("<td class='name'></td>").text(player.name).appendTo(row);
        $("<td class='title'></td>").text(player.title).appendTo(row);
        $("<td class='race'></td>").text(player.race).appendTo(row);
        $("<td class='profession'></td>").text(player.profession).appendTo(row);
        $("<td class='level'></td>").text(player.level).appendTo(row);
        $("<td class='birthday'></td>").text(new Date(player.birthday).toLocaleDateString("en-US")).appendTo(row);
        $("<td class='banned'></td>").text(player.banned).appendTo(row);

        let imgEdit = $("<img src=\"/img/edit.png\" class=\"clickable\" alt=\"edit\">")
            .click(function () {
                let deleteImg = row.find("img[alt=\"delete\"]");
                deleteImg.addClass("hidden");

                let parentTd = $(this).parent();
                parentTd.empty();
                createSaveButton(parentTd, player,row);

                showEditFields(player, row);

            });
        $("<td></td>").append(imgEdit).appendTo(row);

        let imgDelete = $("<img src=\"/img/delete.png\" class=\"clickable\" alt=\"delete\">")
            .click(() => deletePlayer(player.id));
        $("<td></td>").append(imgDelete).appendTo(row);

        tbody.append(row);
    });
}

function createSaveButton(td,player,row) {
    let imgSave = $("<img src=\"/img/save.png\" class=\"clickable\" alt=\"save\">");
    imgSave.on('click', () => {

        const name = row.find('td.name input').val();
        const title = row.find('td.title input').val();
        const race = row.find('td.race select').val();
        const profession = row.find('td.profession select').val();
        const banned = row.find('td.banned select').val();

        const updatedPlayer = {
            id: player.id,
            name: name,
            title: title,
            race: race,
            profession: profession,
            banned: banned,
        };

        // showList();

        $.ajax({
            url: "/rest/players/" + player.id,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(updatedPlayer),
            success: () => {
                showList();
            }
        });
    });
    td.append(imgSave);
}

function showEditFields(player, row) {
    const nameTd = row.find('td.name');
    const titleTd = row.find('td.title');
    const raceTd = row.find('td.race');
    const professionTd = row.find('td.profession');
    const bannedTd = row.find('td.banned');

    nameTd.html(`<input type='text' value='${player.name}'>`);
    titleTd.html(`<input type='text' value='${player.title}'>`);
    raceTd.html(`
        <select>
            <option value="HUMAN" ${player.race === 'HUMAN' ? 'selected' : ''}>HUMAN</option>
            <option value="ORC" ${player.race === 'ORC' ? 'selected' : ''}>ORC</option>
            <option value="DWARF" ${player.race === 'DWARF' ? 'selected' : ''}>DWARF</option>
            <option value="ELF" ${player.race === 'ELF' ? 'selected' : ''}>ELF</option>
            <option value="GIANT" ${player.race === 'GIANT' ? 'selected' : ''}>GIANT</option>
            <option value="TROLL" ${player.race === 'TROLL' ? 'selected' : ''}>TROLL</option>
            <option value="HOBBIT" ${player.race === 'HOBBIT' ? 'selected' : ''}>HOBBIT</option>
        </select>`);
    professionTd.html(`
        <select>
            <option value="WARRIOR" ${player.profession === 'WARRIOR' ? 'selected' : ''}>WARRIOR</option>
            <option value="ROGUE" ${player.profession === 'ROGUE' ? 'selected' : ''}>ROGUE</option>
            <option value="SORCERER" ${player.profession === 'SORCERER' ? 'selected' : ''}>SORCERER</option>
            <option value="CLERIC" ${player.profession === 'CLERIC' ? 'selected' : ''}>CLERIC</option>
            <option value="PALADIN" ${player.profession === 'PALADIN' ? 'selected' : ''}>PALADIN</option>
            <option value="NAZGUL" ${player.profession === 'NAZGUL' ? 'selected' : ''}>NAZGUL</option>
            <option value="WARLOCK" ${player.profession === 'WARLOCK' ? 'selected' : ''}>WARLOCK</option>
        </select>`);
    bannedTd.html(`
      <select>
        <option value="true" ${player.banned === 'true' ? 'selected' : ''}>true</option>
        <option value="false" ${player.banned === 'false' ? 'selected' : ''}>false</option>
     </select>`);
}

function deletePlayer(id) {
    $.ajax({
        method: "DELETE",
        url: "/rest/players/" + id,
        success: function (result) {
            showList();
        }
    });
}