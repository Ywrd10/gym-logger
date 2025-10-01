// Grab elements
const form = document.getElementById('workout-form');
const log = document.getElementById('log');
const clearBtn = document.getElementById('clear-btn');
const totalVolEl = document.getElementById('total-volume');
const canvas = document.getElementById('volumeChart');

//create chart
let chartInstance = null;

// Load persisted workouts
const saved = localStorage.getItem('workouts');
const workouts = saved ? JSON.parse(saved) : [];

// Initial render
displayWorkouts();

// Submit handler
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const date = document.getElementById('date').value;
  const exercise = document.getElementById('exercise').value.trim();
  const sets = parseInt(document.getElementById('sets').value, 10);
  const reps = parseInt(document.getElementById('reps').value, 10);
  const weight = parseFloat(document.getElementById('weight').value);

  if (!date || !exercise || isNaN(sets) || isNaN(reps) || isNaN(weight)) {
    console.warn('Invalid input; ignoring submit');
    return;
  }

  workouts.push({ date, exercise, sets, reps, weight });
  localStorage.setItem('workouts', JSON.stringify(workouts));

  displayWorkouts();
  form.reset();
});

// Clear all feature
clearBtn.addEventListener('click', () => {
  if (!confirm('Are you sure you want to clear all workouts?')) return;
  workouts.length = 0;
  localStorage.removeItem('workouts');
  displayWorkouts();
});

// Render list, totals and chart
function displayWorkouts() {
  // Rebuild the log 
  log.innerHTML = '';
  const frag = document.createDocumentFragment();

  workouts.forEach((w, index) => {
    const row = document.createElement('div');
    row.textContent = `${w.date}: ${w.exercise} - ${w.sets} x ${w.reps} @ ${w.weight} lbs`;

    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.addEventListener('click', () => {
      workouts.splice(index, 1);
      localStorage.setItem('workouts', JSON.stringify(workouts));
      displayWorkouts();
    });

    row.appendChild(del);
    frag.appendChild(row);
  });

  log.appendChild(frag);

  // Total volume
  const total = workouts.reduce((s, w) => s + (w.sets * w.reps * w.weight), 0);
  totalVolEl.textContent = `Total Volume Lifted: ${total} lbs`;

  updateChart();
}

// Create chart
function updateChart() {
  if (!window.Chart || !canvas) return;

  // Aggregate volume per date
  const map = new Map();
  for (const w of workouts) {
    const vol = w.sets * w.reps * w.weight;
    map.set(w.date, (map.get(w.date) || 0) + vol);
  }
  const labels = Array.from(map.keys());
  const data = Array.from(map.values());

  const ctx = canvas.getContext('2d');

  if (!chartInstance) {
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Volume per Day',
          data
        }]
      },
      options: {
        animation: false,             
        responsive: true,
        maintainAspectRatio: false,    
      }
    });
  } else {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.update('none');     
  }
}
