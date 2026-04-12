// Selection screen
// Currently have x and y coords and a horz/vert button.  Once x and y are inputted (even if not valid) the image of the ship should move to the board.
// Ideally there would be a shadow where the ship was before.  Even more ideally if the ship is in an invalid spot, invalid parts will be in red.
// Clicking the vert/horz button should change the orientation of the ship.
// Once go is clicked an error should pop up if there are invalid places/unplaced items.  Once all is finished go to next screen.
// Also drag and drop ships should be a thing, however that means changing the harbor up to have enough space for each ship.
// Maybe can change vert horz to flipping 90degs each time for more customization of boards.

const orientBtns = document.querySelectorAll('.orient');

orientBtns.forEach((btn) => {
  const shipClass = '.' + btn.id.replace('-orient', '');
  const ship = document.querySelector(shipClass);
  btn.addEventListener('click', (e) => {
    btn.classList.toggle('horz');
    btn.classList.toggle('vert');
    if (btn.classList.contains('horz')) {
      btn.textContent = 'Horz';
    } else {
      btn.textContent = 'Vert';
    }
    ship.classList.toggle('flipped');
  });
});
