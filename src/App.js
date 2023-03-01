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

// Your PAT (Personal Access Token) can be found in the portal under Authentification
const PAT = "8ba9ba6ec08a47f49c0e39ded5ddb7c2"
// Specify the correct user_id/app_id pairings
// Since you're making inferences outside your app's scope
const USER_ID = ""
const APP_ID = "face-recognition-brain"
// Change these to whatever model and image URL you want to use
const MODEL_ID = "face-detection"
const MODEL_VERSION_ID = "6dc7e46bc9124c5c8824be4822abe105"
const IMAGE_URL = "https://samples.clarifai.com/metro-north.jpg"

function App() {
	const [input, setInput] = useState("")
	const [imageUrl, setImageUrl] = useState("")
	const [box, setBox] = useState({})
	const [route, setRoute] = useState("signin")
	const [isSignedIn, setIsSignedIn] = useState(false)
	const [user, setUser] = useState({
		id: "",
		name: "",
		email: "",
		password: "",
		entries: 0,
		joined: "",
	})

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
			setIsSignedIn(false)
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
		const raw = JSON.stringify({
			user_app_id: {
				user_id: USER_ID,
				app_id: APP_ID,
			},
			inputs: [
				{
					data: {
						image: {
							url: input,
						},
					},
				},
			],
		})

		const requestOptions = {
			method: "POST",
			headers: {
				Accept: "application/json",
				Authorization: "Key " + PAT,
			},
			body: raw,
		}

		// NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
		// https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
		// this will default to the latest version_id

		fetch(
			"https://api.clarifai.com/v2/models/" +
				MODEL_ID +
				"/versions/" +
				MODEL_VERSION_ID +
				"/outputs",
			requestOptions
		).then((response) =>
			response
				.json()
				.then((data) => {
					if (data) {
						fetch("http://localhost:3001/image", {
							method: "put",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								id: user.id,
							}),
						}).then(res => res.json())
						.then((count) => {
							setUser({...user, entries: count})
						})
					}
					displayFaceBox(calculateFaceLocation(data))
				})
				.catch((error) => console.log("error", error))
		)
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
