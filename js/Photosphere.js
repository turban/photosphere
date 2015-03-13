THREE.Photosphere = function (domEl, image, options) {
	options = options || {};

	var camera, controls, scene, renderer, sphere;

	var webglSupport = (function(){ 
		try { 
			var canvas = document.createElement( 'canvas' ); 
			return !! (window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))); 
		} catch(e) { 
			return false; 
		} 
	})();

	init();
	render();

	function init () {
		// http://threejs.org/docs/#Reference/Cameras/PerspectiveCamera
		camera = new THREE.PerspectiveCamera(options.view || 75, domEl.offsetWidth / domEl.offsetHeight, 1, 1000);
		camera.position.x = 0.1;
		camera.position.y = options.y || 0;

		controls = new THREE.OrbitControls(camera);
		controls.noPan = true;
		controls.noZoom = true; 
		controls.autoRotate = true;
		controls.autoRotateSpeed = options.speed || 0.5;
		controls.addEventListener('change', render);

		scene = new THREE.Scene();

		var texture = THREE.ImageUtils.loadTexture(image);
		texture.minFilter = THREE.LinearFilter;

		sphere = new THREE.Mesh(
			new THREE.SphereGeometry(100, 20, 20),
			new THREE.MeshBasicMaterial({
				map: texture
			})
		);

		sphere.scale.x = -1;
		scene.add(sphere);

		renderer = webglSupport ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
		renderer.setSize(domEl.offsetWidth, domEl.offsetHeight);		

		domEl.appendChild(renderer.domElement);

		domEl.addEventListener('mousewheel', onMouseWheel, false);
		domEl.addEventListener('DOMMouseScroll', onMouseWheel, false);

		animate();
	}

	function render () {
		renderer.render(scene, camera);
	}

	function animate () {
		requestAnimationFrame(animate);
		controls.update();
	}

	function onMouseWheel (evt) {
		evt.preventDefault();
			
		if (evt.wheelDeltaY) { // WebKit
			camera.fov -= evt.wheelDeltaY * 0.05;
		} else if (evt.wheelDelta) { 	// Opera / IE9
			camera.fov -= evt.wheelDelta * 0.05;
		} else if (evt.detail) { // Firefox
			camera.fov += evt.detail * 1.0;
		}
		camera.fov = Math.max(20, Math.min(100, camera.fov));
		camera.updateProjectionMatrix();
	}

	function resize () {
		camera.aspect = domEl.offsetWidth / domEl.offsetHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(domEl.offsetWidth, domEl.offsetHeight);
		render();
	}

	// http://stackoverflow.com/questions/21548247/clean-up-threejs-webgl-contexts
	function remove () {
		scene.remove(sphere);
		while (domEl.firstChild) {
			domEl.removeChild(domEl.firstChild);
		}
	}

	return {
		resize: resize,
		remove: remove
	}
};