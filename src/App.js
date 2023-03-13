import { useState, useEffect } from "react"
import "./App.css"
import Navigation from "./components/Navigation/Navigation"
import Logo from "./components/Logo/Logo"
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm"
import Rank from "./components/Rank/Rank"
import ParticlesBg from "particles-bg"
import FaceRecognition from "./components/FaceRecognition/FaceRecognition"
import SignIn from "./components/SignIn/SignIn"
import Register from "./components/Register/Register"

const initialState = {
	user: {
		id: "",
		name: "",
		email: "",
		password: "",
		entries: 0,
		joined: "",
	},
	input: "",
	imageUrl: "",
	box: {},
	route: "signin",
	isSignedIn: false,
}

function App() {
	const [input, setInput] = useState(initialState.input)
	const [imageUrl, setImageUrl] = useState(initialState.imageUrl)
	const [box, setBox] = useState(initialState.box)
	const [route, setRoute] = useState(initialState.route)
	const [isSignedIn, setIsSignedIn] = useState(initialState.isSignedIn)
	const [user, setUser] = useState(initialState.user)

	const loadUser = (data) => {
		setUser({
			id: data.id,
			name: data.name,
			email: data.email,
			password: data.password,
			entries: data.entries,
			joined: data.joined,
		})
	}

	const calculateFaceLocation = (data) => {
		const clarifaiFace =
			data.outputs[0].data.regions[0].region_info.bounding_box
		const image = document.getElementById("inputimage")
		const width = Number(image.width)
		const height = Number(image.height)
		return {
			leftCol: clarifaiFace.left_col * width,
			topRow: clarifaiFace.top_row * height,
			rightCol: width - clarifaiFace.right_col * width,
			bottomRow: height - clarifaiFace.bottom_row * height,
		}
	}

	const displayFaceBox = (box) => {
		setBox(box)
	}

	const onInputChange = (event) => {
		setInput(event.target.value)
	}

	const onRouteChange = (newroute) => {
		if (newroute === "signout") {
			setIsSignedIn(initialState.isSignedIn)
			setUser(initialState.user)
			setBox(initialState.box)
			setImageUrl(initialState.imageUrl)
			setRoute(initialState.route)
		} else if (newroute === "home") {
			setIsSignedIn(true)
		}
		setRoute(newroute)
	}

	const onButtonSubmit = () => {
		///////////////////////////////////////////////////////////////////////////////////
		// YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS LINE TO RUN THIS EXAMPLE
		///////////////////////////////////////////////////////////////////////////////////

		setImageUrl(input)

		fetch("http://localhost:3001/imageurl", {
			method: "post",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				input: input,
			}),
		})
			.then((response) => response.json())

			.then((data) => {
				if (data) {
					fetch("http://localhost:3001/image", {
						method: "put",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							id: user.id,
						}),
					})
						.then((response) => response.json())
						.then((count) => {
							setUser({ ...user, entries: count })
						})
						.catch((error) => console.log("error", error))
				}
				displayFaceBox(calculateFaceLocation(data))
			})
	}

	return (
		<div className="App">
			<ParticlesBg type="circle" bg={true} />
			<Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
			{route === "home" ? (
				<div>
					<Logo />

					<Rank userName={user.name} userEntries={user.entries} />
					<ImageLinkForm
						onInputChange={onInputChange}
						onButtonSubmit={onButtonSubmit}
					/>

					<FaceRecognition box={box} imageUrl={imageUrl} />
				</div>
			) : route === "signin" ? (
				<SignIn onRouteChange={onRouteChange} loadUser={loadUser} />
			) : (
				<Register onRouteChange={onRouteChange} loadUser={loadUser} />
			)}
		</div>
	)
}

export default App
