<script>
  import { theme } from '../stores/theme';
  let hostname = window.location.hostname;
  let date = new Date().toLocaleDateString();
</script>

<h1 class="font-bold flex">
  <span style={`color: ${$theme.brightRed}`}>{date}</span>
  <span style={`color: ${$theme.white}`}>:</span>
  <span style={`color: ${$theme.yellow};`}>guest</span>
  <span style={`color: ${$theme.white}`}>@</span>
  <span style={`color: ${$theme.green}`}>{hostname}</span>
  <span style={`color: ${$theme.white}`}>:~$</span>
</h1>
