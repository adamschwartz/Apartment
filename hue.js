const HUE = {
  // TODO - walk user through finding these instead of hard-coding
  username: 'Zhbo-QPHAradDdtdc-4tYfjiUfvaIZYZ5yFBWDXQ',
  internalipaddress: '10.0.0.206'
}

HUE.getLights = function() {
  return fetch('http://' + HUE.internalipaddress + '/api/' + HUE.username + '/lights', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
}

HUE.setLight = function(lightNumber, data) {
  return fetch('http://' + HUE.internalipaddress + '/api/' + HUE.username + '/lights/' + lightNumber + '/state', {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
}

HUE.setGroup = function(groupNumber, data) {
  return fetch('http://' + HUE.internalipaddress + '/api/' + HUE.username + '/groups/' + groupNumber + '/action', {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
}


module.exports = HUE
