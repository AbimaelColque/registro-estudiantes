const dbName = "RegistroEstudiantesDB";
const dbVersion = 1;
let db;

const openDB = () => {
  const request = indexedDB.open(dbName, dbVersion);
  request.onupgradeneeded = function(e) {
    db = e.target.result;
    
    if (!db.objectStoreNames.contains("estudiantes")) {
      db.createObjectStore("estudiantes", { keyPath: "id", autoIncrement: true });
    }
    
    if (!db.objectStoreNames.contains("cursos")) {
      db.createObjectStore("cursos", { keyPath: "id", autoIncrement: true });
    }
    
    if (!db.objectStoreNames.contains("inscripciones")) {
      const store = db.createObjectStore("inscripciones", { 
        keyPath: "id", 
        autoIncrement: true 
      });
      
      store.createIndex("by_estudiante", "estudianteId", { unique: false });
      store.createIndex("by_curso", "cursoId", { unique: false });
    }
  };

  request.onsuccess = function (e) {
    db = e.target.result;
    refrescarTodo();
  };
  request.onerror = function (e) {
    console.error("Error al abrir la base de datos:", e.target.error);
  };
};

const guardarEstudiante = () => {
  const id = document.getElementById("idEstudiante").value;
  const nombre = document.getElementById("nombreEstudiante").value;
  const apellido = document.getElementById("apellidoEstudiante").value;
  const email = document.getElementById("emailEstudiante").value;
  
  if (!nombre || !apellido || !email) {
    alert("Por favor complete todos los campos del estudiante");
    return;
  }

  const tx = db.transaction("estudiantes", "readwrite");
  const store = tx.objectStore("estudiantes");

  if (id) {
    store.put({ id: parseInt(id), nombre, apellido, email });
  } else {
    store.add({ nombre, apellido, email });
  }

  tx.oncomplete = () => {
    limpiarCamposEstudiante();
    refrescarTodo();
  };
};

const editarEstudiante = (id) => {
  const tx = db.transaction("estudiantes", "readonly");
  const store = tx.objectStore("estudiantes");
  const request = store.get(id);
  request.onsuccess = () => {
    const data = request.result;
    document.getElementById("idEstudiante").value = data.id;
    document.getElementById("nombreEstudiante").value = data.nombre;
    document.getElementById("apellidoEstudiante").value = data.apellido;
    document.getElementById("emailEstudiante").value = data.email;
    document.getElementById("btnEstudiante").innerHTML = '<i class="fas fa-save me-2"></i>Actualizar Estudiante';
  };
};

const limpiarCamposEstudiante = () => {
  document.getElementById("idEstudiante").value = "";
  document.getElementById("nombreEstudiante").value = "";
  document.getElementById("apellidoEstudiante").value = "";
  document.getElementById("emailEstudiante").value = "";
  document.getElementById("btnEstudiante").innerHTML = '<i class="fas fa-save me-2"></i>Agregar Estudiante';
};

const guardarCurso = () => {
  const id = document.getElementById("idCurso").value;
  const nombre = document.getElementById("nombreCurso").value;
  const descripcion = document.getElementById("descCurso").value;
  
  if (!nombre || !descripcion) {
    alert("Por favor complete todos los campos del curso");
    return;
  }

  const tx = db.transaction("cursos", "readwrite");
  const store = tx.objectStore("cursos");

  if (id) {
    store.put({ id: parseInt(id), nombre, descripcion });
  } else {
    store.add({ nombre, descripcion });
  }

  tx.oncomplete = () => {
    limpiarCamposCurso();
    refrescarTodo();
  };
};

const editarCurso = (id) => {
  const tx = db.transaction("cursos", "readonly");
  const store = tx.objectStore("cursos");
  const request = store.get(id);
  request.onsuccess = () => {
    const data = request.result;
    document.getElementById("idCurso").value = data.id;
    document.getElementById("nombreCurso").value = data.nombre;
    document.getElementById("descCurso").value = data.descripcion;
    document.getElementById("btnCurso").innerHTML = '<i class="fas fa-save me-2"></i>Actualizar Curso';
  };
};

const limpiarCamposCurso = () => {
  document.getElementById("idCurso").value = "";
  document.getElementById("nombreCurso").value = "";
  document.getElementById("descCurso").value = "";
  document.getElementById("btnCurso").innerHTML = '<i class="fas fa-save me-2"></i>Agregar Curso';
};

const guardarInscripcion = () => {
  const id = document.getElementById("idInscripcion").value;
  const estudianteId = parseInt(document.getElementById("selectEstudiante").value);
  const cursoId = parseInt(document.getElementById("selectCurso").value);
  
  if (!estudianteId || !cursoId) {
    alert("Por favor seleccione un estudiante y un curso");
    return;
  }

  const tx = db.transaction("inscripciones", "readwrite");
  const store = tx.objectStore("inscripciones");

  if (id) {
    store.put({ id: parseInt(id), estudianteId, cursoId });
  } else {
    store.add({ estudianteId, cursoId });
  }

  tx.oncomplete = () => {
    limpiarCamposInscripcion();
    refrescarTodo();
  };
};

const editarInscripcion = (id) => {
  const tx = db.transaction("inscripciones", "readonly");
  const store = tx.objectStore("inscripciones");
  const request = store.get(id);
  request.onsuccess = () => {
    const data = request.result;
    document.getElementById("idInscripcion").value = data.id;
    document.getElementById("selectEstudiante").value = data.estudianteId;
    document.getElementById("selectCurso").value = data.cursoId;
    document.getElementById("btnInscripcion").innerHTML = '<i class="fas fa-save me-2"></i>Actualizar Inscripción';
  };
};

const limpiarCamposInscripcion = () => {
  document.getElementById("idInscripcion").value = "";
  document.getElementById("selectEstudiante").value = "";
  document.getElementById("selectCurso").value = "";
  document.getElementById("btnInscripcion").innerHTML = '<i class="fas fa-save me-2"></i>Registrar Inscripción';
};

const eliminarRegistro = (storeName, id) => {
  if (!confirm("¿Eliminar este registro?")) return;

  id = parseInt(id);
  const tx = db.transaction([storeName, "inscripciones"], "readwrite");
  
  const mainStore = tx.objectStore(storeName);
  const inscripcionesStore = tx.objectStore("inscripciones");

  if (storeName === "estudiantes" || storeName === "cursos") {
    const field = storeName === "estudiantes" ? "estudianteId" : "cursoId";
    const request = inscripcionesStore.getAll();
    
    request.onsuccess = () => {
      const todasInscripciones = request.result;
      const aEliminar = todasInscripciones.filter(ins => ins[field] === id);
      
      aEliminar.forEach(ins => {
        inscripcionesStore.delete(ins.id);
      });
      
      mainStore.delete(id);
    };
  } else {
    mainStore.delete(id);
  }

  tx.oncomplete = refrescarTodo;
  tx.onerror = (e) => alert("Error: " + e.target.error.message);
};

const obtenerTodos = (storeName, callback) => {
  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);
  const request = store.getAll();
  request.onsuccess = () => callback(request.result);
};

const refrescarTodo = () => {
  mostrarEstudiantes();
  mostrarCursos();
  mostrarInscripciones();
};

const mostrarEstudiantes = () => {
  obtenerTodos("estudiantes", estudiantes => {
    const tbody = document.getElementById("tablaEstudiantes").querySelector("tbody");
    tbody.innerHTML = "";
    const select = document.getElementById("selectEstudiante");
    select.innerHTML = "<option value=''>Seleccione un estudiante</option>";
    estudiantes.forEach(est => {
      const row = `<tr>
        <td>${est.id}</td>
        <td>${est.nombre}</td>
        <td>${est.apellido}</td>
        <td>${est.email}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editarEstudiante(${est.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="eliminarRegistro('estudiantes', ${est.id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>`;
      tbody.innerHTML += row;
      select.innerHTML += `<option value="${est.id}">${est.nombre} ${est.apellido}</option>`;
    });
  });
};

const mostrarCursos = () => {
  obtenerTodos("cursos", cursos => {
    const tbody = document.getElementById("tablaCursos").querySelector("tbody");
    tbody.innerHTML = "";
    const select = document.getElementById("selectCurso");
    select.innerHTML = "<option value=''>Seleccione un curso</option>";
    cursos.forEach(curso => {
      const row = `<tr>
        <td>${curso.id}</td>
        <td>${curso.nombre}</td>
        <td>${curso.descripcion}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editarCurso(${curso.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="eliminarRegistro('cursos', ${curso.id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>`;
      tbody.innerHTML += row;
      select.innerHTML += `<option value="${curso.id}">${curso.nombre}</option>`;
    });
  });
};

const mostrarInscripciones = () => {
  obtenerTodos("inscripciones", inscripciones => {
    obtenerTodos("estudiantes", estudiantes => {
      obtenerTodos("cursos", cursos => {
        const tbody = document.getElementById("tablaInscripciones").querySelector("tbody");
        tbody.innerHTML = "";
        inscripciones.forEach(ins => {
          const est = estudiantes.find(e => e.id === ins.estudianteId);
          const curso = cursos.find(c => c.id === ins.cursoId);
          const row = `<tr>
            <td>${ins.id}</td>
            <td>${est ? est.nombre + " " + est.apellido : "?"}</td>
            <td>${curso ? curso.nombre : "?"}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="editarInscripcion(${ins.id})">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger" onclick="eliminarRegistro('inscripciones', ${ins.id})">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>`;
          tbody.innerHTML += row;
        });
      });
    });
  });
};

window.onload = openDB;