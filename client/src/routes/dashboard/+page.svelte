<script>
  let tags = []

  const addTag = () => {
    const tagInput = document.getElementById("tag")
    const tagValue = tagInput.value.trim()

    if (tagValue) {
      tags = [...tags, tagValue]
      tagInput.value = ""
    } else {
      alert("Please enter a tag!")
    }
  }

  const removeTag = (event) => {
    const toRemoveTag = event.target.innerText
    tags = tags.filter((tag) => tag !== toRemoveTag)
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
</script>

<div class="dashboard">
  <div class="sidebar">
    <a href="#" class="sidebar-text"><p>Upload</p></a>
    <a href="#" class="sidebar-text"><p>My Images</p></a>

    <a href="#" class="sidebar-text"><p>Settings</p></a>
    <a href="#" class="sidebar-text"><p>Thomas</p></a>
  </div>
  <div class="content">
    <h2>Upload an Image</h2>

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
            <span on:click={removeTag}>{tag}</span>
          {/each}
          <button type="button" on:click={addTag}>Add tag</button></span
        >
        <br />
        <input type="file" name="file" required />
        <br />
        <button type="submit">Confirm</button>
      </form>
    </div>
  </div>
</div>

<style>
  .dashboard {
    display: flex;
    /* justify-content: space-between; */
    padding: 2rem;
  }

  .sidebar {
    width: 15rem;
    background-color: #007aff;
    color: #fff;
    border-radius: 42px;
    height: 80vh;
  }
  label {
    color: #7f7f7f;
  }

  .sidebar-text {
    font-size: 1.6rem;
    color: #fff;
    text-decoration: none;
  }

  .content {
    max-width: calc(100% - 15rem);
    flex: 1;
    padding: 0px 2rem;
  }

  .main-card {
    background-color: #f2f9ff;
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
  }

  @media (max-width: 768px) {
    .dashboard {
      flex-direction: column;
    }

    .content,
    .sidebar {
      width: 100%;
      max-width: none;
      height: auto;
    }

    .sidebar {
      display: flex;
    }
  }
</style>
