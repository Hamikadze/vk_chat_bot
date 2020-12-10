let COMMANDS = [];

function addCommand(data, func) {
    COMMANDS.unshift({data: data, func: func});
}


function getCommand(index) {
    if (COMMANDS.length > index)
        return COMMANDS[index];
}

module.exports = {
    addCommand: addCommand,
    getCommand: getCommand,
    commands: COMMANDS
}

