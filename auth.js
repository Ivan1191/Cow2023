var node_acl = require('acl');

let acl = new node_acl(new node_acl.memoryBackend());
var loginIDandSessionIDMap = []
var loginIDandRoleMap = []

function logger() {
    return {
        debug: function (msg) {
            // console.log('-DEBUG-', msg);
        }
    };
}

function get_user_id(req) {
    return req.session.loginID;
}

function setAcl(authInfo) {
    //console.log(authInfo);
    authInfo.forEach(function (allow) {
        // console.log('******' + allow['role'] + '******')
        if (allow['allows'] != null) {
            allow['allows'].forEach(function (opt) {
                // console.log(opt)
                module.exports.acl.allow(allow['role'], opt, '*')
            })
        }
    })
}

function addRolePermissions(role, permissions) {
    // console.log('***AUTH*** Remove role ' + role)
    module.exports.acl.whatResources(role, function (err, resources) {
        var keys = Object.keys(resources);
        // console.log('Role ' + role + ' remove ' + keys)
        module.exports.acl.removeAllow(role, keys, '*')
        if (permissions != undefined) {
            permissions.forEach(function (p) {
                module.exports.acl.allow(role, p, '*')
            })
        }
    })
    // console.log('***AUTH*** Add permission ' + permissions + ' to role ' + role)
    module.exports.acl.whatResources(role, function (err, resources) {
        var keys = Object.keys(resources);
        // console.log(keys)
    })
}

function removeRolePermission(role, permission) {
    module.exports.acl.removeAllow(role, permission, ['get', 'post'])
    // console.log('***AUTH*** Remove permission ' + permisson + ' to role ' + role)
}

function removeRole(role) {
    // console.log('***AUTH*** Remove role ' + role)
    module.exports.acl.whatResources(role, function (err, resources) {
        var keys = Object.keys(resources);
        // console.log('Role ' + role + 'remove ' + keys)
        module.exports.acl.removeAllow(role, keys, '*')
    })
}

function addUserRole(user, role) {
    module.exports.acl.userRoles(user, function (err, old_roles) {
        module.exports.acl.removeUserRoles(user, old_roles, function () {
            // console.log('***AUTH*** Remove role ' + old_roles)

        }).then(function(){
            module.exports.acl.addUserRoles(user, role);
            loginIDandRoleMap[user] = role;
            // console.log('***AUTH*** User ' + user + ' get role ' + role);
        });
    })
}

function removeUserRoles(user, role) {
    module.exports.acl.removeUserRoles(user, role)
    // console.log('***AUTH*** User ' + user + ' remove role ' + role)
}

function setDuplicateMap(loginID, uuid) {
    module.exports.loginIDandSessionIDMap[loginID] = uuid
}

function clearSessionByRole(role){
    const keys = Object.keys(loginIDandRoleMap);
    keys.forEach(function(key){
        if(loginIDandRoleMap[key] == role){
            module.exports.loginIDandSessionIDMap[key] = 0;
        }
    })
}

module.exports.acl = acl;
module.exports.get_user_id = get_user_id;
module.exports.setAcl = setAcl;
module.exports.addRolePermissions = addRolePermissions;
module.exports.removeRolePermission = removeRolePermission;
module.exports.removeRole = removeRole;
module.exports.addUserRole = addUserRole;
module.exports.removeUserRoles = removeUserRoles;
module.exports.loginIDandSessionIDMap = loginIDandSessionIDMap
module.exports.setDuplicateMap = setDuplicateMap
module.exports.clearSessionByRole = clearSessionByRole