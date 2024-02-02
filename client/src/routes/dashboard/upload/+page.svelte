<script>
  import { onMount } from "svelte"
  import Dashboard from "$lib/components/Dashboard.svelte"

  let tags = []

  const addTag = () => {
    const tagInput = document.getElementById("tag")
    const tagValue = tagInput.value.trim()

    if (tagValue) {
      if (!tags.includes(tagValue)) {
        tags = [...tags, tagValue]
        tagInput.value = ""
      } else {
        alert("Tag already exists!")
      }
    } else {
      alert("Please enter a tag!")
    }
  }

  const removeTag = (event) => {
    const toRemoveTag = event.target.innerText
    console.log(tags)
    tags = tags.filter((tag) => tag !== toRemoveTag)
    console.log(tags)
  }

  const handleSubmit = async (event) => {
    const formData = new FormData(event.target)

    const title = formData.get("title").trim()
    const description = formData.get("description")?.trim() ?? ""
    const uploadedFile = formData.get("file")
    const url = uploadedFile.name

    const data = { title, description, tags, url }
    const response = await fetch(`http://localhost:4000/images`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    const reply = await response.json()
    if (response.ok) {
      alert(`${reply.message}`)
    } else {
      alert(`${reply.error}`)
    }
  }

  onMount(async () => {})
</script>

<div class="container">
  <Dashboard />
  <div class="content">
    <h3>Upload an Image:</h3>

    <div class="main-card">
      <form class="card-form" on:submit|preventDefault={handleSubmit}>
        <span>
          <label for="title">Title*:</label>
          <br />
          <input type="text" name="title" required /></span
        >
        <span>
          <label for="title">Description:</label>
          <br />
          <input type="text" name="description" /></span
        >
        <span>
          <label for="title">Tags:</label>
          <br />
          <input type="text" name="tag" id="tag" />
          {#each tags as tag}
            <button type="button" on:click={removeTag}>{tag}<i class="fa fa-times" aria-hidden="true"></i> </button>
          {/each}
          <br />
          <button class="submit-button" type="button" on:click={addTag}>Add tag</button>
        </span>
        <br />
        <input class="upload-file" type="file" name="file" required />
        <br />
        <button class="submit-button" t ype="submit">Confirm</button>
      </form>
    </div>
  </div>
</div>

<style>
  .container {
    display: flex;
  }

  .content {
    flex: 1;
    padding: 0px 2rem;
    margin-left: 14vw;
  }

  .main-card {
    background-color: #1ca496;
    border-radius: 0.8rem;
    box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .card-form {
    display: flex;
    justify-content: center;
    align-items: space-between;
    flex-direction: column;
    color: white;
  }

  input {
    margin-bottom: 1rem;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.3rem;
  }

  .submit-button {
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 0.3rem;
    font-size: 1rem;
    background-color: #172740;
    color: #fff;
    cursor: pointer;
    border: none;
    padding: 0.5rem 1rem;
  }
</style>
