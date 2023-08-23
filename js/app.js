let current_user_id;
let current_user_buses_id = [];
let users = [];
let buses = [];

function listarUsuarios() {
  const select = document.getElementById('usuarios');
  for (let i = 0; i < users.length; i++) {
    const opt = document.createElement('option');
    opt.value = users[i].id;
    opt.innerHTML = users[i].name;
    select.appendChild(opt);
  }
}

function calcularDisponibilidad(bus_id){
  let bus = buses.filter(obj => {return obj.id === bus_id})[0];
  let disponible = bus.capacity - bus.books.length;
  if(current_user_id){
    if(current_user_buses_id.includes(bus_id) && !bus.books.includes(current_user_id)){
      disponible -= 1
    } else if(!current_user_buses_id.includes(bus_id) && bus.books.includes(current_user_id)){
      disponible += 1
    }
  }
  return disponible;
}

function actualizarTablaHorario() {
  const new_tbody = document.createElement('tbody');
  for (let i = 0; i < buses.length; i++) {
    let disabled = ''
    let accion = 'Reservar';
    let backgroundColor = '';
    const disponible = calcularDisponibilidad(buses[i].id);
    if (!current_user_id) disabled = 'disabled';
    if (current_user_buses_id.includes(buses[i].id)) {
      accion = 'Descartar';
      backgroundColor = '#9EAAAD';
    }else if(disponible == 0){
      disabled = 'disabled';
    }

    const myHtmlContent =
      `<td class="centrado">${i + 1}</td>
      <td class="centrado">${buses[i].name}</td>
      <td class="centrado">${buses[i].schedule}</td>
      <td class="centrado">${buses[i].capacity}</td>
      <td class="centrado">${disponible}</td>
      <td class="centrado">
        <button class="btn btn-success" onclick="reservar('${buses[i].id}')" ${disabled}>${accion}</button>
      </td>`;
    const newRow = new_tbody.insertRow(new_tbody.rows.length);
    newRow.innerHTML = myHtmlContent;
    newRow.style.backgroundColor = backgroundColor;
  }
  const old_tbody = document.getElementById('horarios').getElementsByTagName('tbody')[0];
  old_tbody.parentNode.replaceChild(new_tbody, old_tbody)
}

function reservar(bus_id) {
  if (current_user_buses_id.includes(bus_id)) {
    current_user_buses_id.splice(current_user_buses_id.indexOf(bus_id), 1);
  } else {
    current_user_buses_id.push(bus_id);
  }
  actualizarTablaHorario()
}

function guardar() {
  if (current_user_id) {
    const data = {
      user_id: current_user_id,
      buses_id: current_user_buses_id
    }
    document.getElementById('btn-save').disabled = true;
    fetch('https://d3tn0sg1z5.execute-api.sa-east-1.amazonaws.com/bookings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(data => {
        fetchBuses();
        document.getElementById('btn-save').disabled = false;
        console.log(data)
      });

  } else {
    alert('Debe seleccionar un usuario');
  }
}

function fetchUsers(){
  fetch('https://d3tn0sg1z5.execute-api.sa-east-1.amazonaws.com/users')
  .then(response => response.json())
  .then(data => {
    users = data;
    listarUsuarios();
  });
}

function fetchBuses(){
  fetch('https://d3tn0sg1z5.execute-api.sa-east-1.amazonaws.com/buses')
    .then(response => response.json())
    .then(data => {
      buses = data;
      actualizarTablaHorario();
    });
}

fetchUsers();
fetchBuses();

// Evento Cambiar de usuario en Select
document.getElementById("usuarios").addEventListener('change', (event) => {
  current_user_buses_id = [];
  if (event.target.value) {
    current_user_id = event.target.value;
    for (let i = 0; i < buses.length; i++) {
      if (buses[i].books.includes(current_user_id)) {
        current_user_buses_id.push(buses[i].id);
      }
    }
  } else {
    current_user_id = null;
  }
  actualizarTablaHorario();
});

// Evento Guardar reservas por usuario en BD
document.getElementById("btn-save").onclick = function () { guardar() };
