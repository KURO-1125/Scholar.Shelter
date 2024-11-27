document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:3000/hostels')
        .then(response => response.json())
        .then(data => {
            const hostelsDiv = document.getElementById('hostels');
            data.forEach(hostel => {
                const hostelDiv = document.createElement('div');
                hostelDiv.className = 'hostel';

                const name = document.createElement('h2');
                name.textContent = hostel.name;
                hostelDiv.appendChild(name);

                const location = document.createElement('p');
                location.textContent = `Location: ${hostel.location}`;
                hostelDiv.appendChild(location);

                const price = document.createElement('p');
                price.textContent = `Price: ${hostel.price}`;
                hostelDiv.appendChild(price);

                const amenities = document.createElement('p');
                amenities.textContent = `Amenities: ${hostel.amenities.join(', ')}`;
                hostelDiv.appendChild(amenities);

                const rating = document.createElement('p');
                rating.textContent = `Rating: ${hostel.rating}`;
                hostelDiv.appendChild(rating);

                hostelsDiv.appendChild(hostelDiv);
            });
        })
        .catch(error => console.error('Error fetching hostels:', error));
});