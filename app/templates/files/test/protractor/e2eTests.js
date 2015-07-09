describe('<%= componentCamelName %>', function() {
  it('has a useless e2e test', function() {
    browser.get('http://localhost:9000/test/manual.html');

    expect(browser.getTitle()).toEqual('Manual Test for <%= componentTitle %>');
  });
});
