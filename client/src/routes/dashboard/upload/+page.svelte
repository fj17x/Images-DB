<script>
  import Dashboard from "$lib/components/Dashboard.svelte"
  import AlertModal from "$lib/components/AlertModal.svelte"
  import { onMount } from "svelte"

  let tags = []

  let showAlertModal = false
  let alertModalOptions = {}

  let toAddTag

  const addTag = () => {
    const tagValue = toAddTag.trim()

    if (tagValue) {
      if (!tags.includes(tagValue)) {
        tags = [...tags, tagValue]
        toAddTag = ""
      } else {
        alertModalOptions.header = "Could not add tag"
        alertModalOptions.message = "Tag already exists!"
        alertModalOptions.type = "failure"
        showAlertModal = true
      }
    } else {
      alertModalOptions.header = "Could not add tag"
      alertModalOptions.message = "Please enter a tag!"
      alertModalOptions.type = "failure"
      showAlertModal = true
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
    tags = []
    if (response.ok) {
      alertModalOptions.header = "Uploaded successfully"
      alertModalOptions.message = reply.message
      alertModalOptions.type = "success"
      showAlertModal = true
    } else {
      alertModalOptions.header = "Could not upload"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
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
          <textarea rows="4" cols="20" name="description" /></span
        >
        <span>
          <label for="title">Tags:</label>
          <br />
          <input type="text" name="tag" bind:value={toAddTag} id="tag" />
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

{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {...alertModalOptions}></AlertModal>
{/if}

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
  textarea {
    margin-bottom: 1rem;
    padding: 0.5rem;
    max-width: 800px;
    min-width: 250px;
    max-height: 300px;
    max-height: 300px;
    border: 1px solid #ccc;
    border-radius: 0.3rem;
    width: 10rem;
  }
</style>
