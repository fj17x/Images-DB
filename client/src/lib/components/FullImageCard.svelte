<script>
  export let url, title, description, id, tags, createdAt, modifiedAt, ownerId, isFlagged
</script>

<div class="full-image-card">
  <a href="/dashboard/myimages/{id}" class="anchor">
    <img src={url} alt={title} />
    <div class="details">
      <p class="title">{title}</p>
      <p class="description">{description}</p>
      <div class="tags">
        {#each tags as tag (tag.id)}
          <span class="tag">{tag.name}</span>
        {/each}
      </div>
      <p class="created-at">Created at: {createdAt}</p>
      <p class="modified-at">Last modified at: {modifiedAt}</p>
    </div>
  </a>
</div>

<style>
  .full-image-card {
    border-radius: 8px;
    overflow: hidden;
    width: 300px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease-in-out;
  }

  .full-image-card:hover {
    transform: scale(1.05);
  }

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px 8px 0 0;
  }

  .details {
    padding: 1rem;
    background-color: #172740;
    color: #fff;
    border-radius: 0 0 8px 8px;
  }

  .title {
    margin: 0;
    font-size: 1.2rem;
  }

  .description {
    margin-top: 0.4rem;
    font-size: 0.9rem;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    margin-top: 0.4rem;
  }

  .tag {
    background-color: #4caf50;
    color: #fff;
    border-radius: 4px;
    padding: 0.2rem 0.5rem;
    margin-right: 0.5rem;
    margin-bottom: 0.3rem;
    font-size: 0.8rem;
  }

  .created-at,
  .modified-at {
    margin-top: 0.4rem;
    font-size: 0.8rem;
  }

  .anchor {
    text-decoration: none;
    color: #fff;
  }
</style>
